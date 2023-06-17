import { HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { CreatedS3ImageFile, CreatedS3ImageFiles } from "src/aws/interface/awsS3.interface";
import { PostPaginationDto, createPaginationObject } from "src/common/dto/pagination.dto";
import { Comment } from "src/entity/comment.entity";
import { Hashtag } from "src/entity/hashtag.entity";
import { Image } from "src/entity/image.entity";
import { Liked } from "src/entity/liked.entity";
import { PostTags } from "src/entity/post-tags.entity";
import { Post } from "src/entity/post.entity";
import { User } from "src/entity/user.entity";
import { CreatePostDto, CreateTemplatePostDto, UpdatePostDto } from "src/posts/dto/create.post.dto";
import { ImageResponse } from "src/posts/interface/post-image.interface";
import { BaseHashTag, FriendStatusDictionary, GetPostsPaginationResponse, PostCreateResponse, PostGetResponse, PostUserResponse, SearchUserResponse, SnsBaseUser } from "src/posts/interface/post.interface";
import { In, Repository } from "typeorm";
import { UserInfoResponse } from "./interface/user-info.interface";
import { UpdateProfileDto } from "src/users/dto/profile.dto";
import { Template } from "src/entity/template.entity";
import { RawHashTag, RawImage, RawPost } from "./interface/raw-post.interface";
import { getImageUrl } from "src/common/utils/s3";
import { calculateSkip } from "./post.util";
import { Friend } from "src/entity/friend.entity";
import { FriendStatus } from "src/common/utils/constants";
import { isBadWord } from "src/common/utils/bad-word";

export class PostRepository {
    public readonly S3_URL: string;

    constructor(
        @InjectRepository(Post) private readonly repository: Repository<Post>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Template) private readonly templateRepository: Repository<Template>,
        @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
        @InjectRepository(PostTags) private readonly postTagsRepository: Repository<PostTags>,
        @InjectRepository(Liked) private readonly likedRepository: Repository<Liked>,
        @InjectRepository(Comment) private readonly commentRepository: Repository<Comment>,
        @InjectRepository(Friend) private readonly friendRepository: Repository<Friend>,
        private readonly configService: ConfigService
    ) {
        this.S3_URL = this.configService.get('AWS_S3_URL'); // nest-s3
    }


    createPostImage(image: any, savedPost: Post): Image {
        const postImage = new Image();
        postImage.post = savedPost;
        postImage.originalName = image.originalName;
        postImage.url = image.key;
        postImage.mimeType = image.contentType;
        postImage.size = image.size;
        return postImage;
    }

    async savePostImages(images: CreatedS3ImageFiles, savedPost: Post): Promise<Image[]> {
        const postImages = images.uploadedFiles.map((image) => this.createPostImage(image, savedPost));
        return await this.imageRepository.save(postImages);
    }

    createPostResponse(
        savedPost: Post,
        savedPostImages: Image[],
        createPostDto: CreatePostDto,
    ): PostCreateResponse {

        if(typeof createPostDto.hashTags === 'string'){
            createPostDto.hashTags = [createPostDto.hashTags]
        }
        
        if(createPostDto.hashTags === null || createPostDto.hashTags  === undefined){
            createPostDto.hashTags = []
        }

        return {
            id: savedPost.id,
            images: savedPostImages.map(({ id, originalName, url, mimeType }) => ({ id, originalName, url: this.S3_URL + url, mimeType, comments: [] })),
            hashTags: createPostDto.hashTags,
            content: savedPost.content,
            templateUrl : getImageUrl(this.configService, savedPost.template?.url),
            createdAt: savedPost.createdAt,
            updatedAt: savedPost.updatedAt,
        };
    }

    async createTemplate(userId: string, images: CreatedS3ImageFiles) {
        const templates = []
        images.uploadedFiles.forEach((image) => {
            const template = this.templateRepository.create({ originalName: image.originalName, url: image.key, mimeType: image.contentType, size: image.size });
            templates.push(template)
        })
        const ret = await this.templateRepository.save(templates)
        ret.map((template) => {
            template.url = this.S3_URL + template.url
        })

        return ret
    }

    async getTemplates(userId: string) {
        const templates = await this.templateRepository.find({ order: { createdAt: 'ASC' } })
        templates.map((template) => {
            template.url = getImageUrl(this.configService, template.url)
        })
        return templates.map(({ id, originalName, url, mimeType }) => ({ id, originalName, url, mimeType }))
    }

    async createTemplatePost(userId: string, createPostDto: CreateTemplatePostDto): Promise<PostCreateResponse> {
        const { content, templateId, templateTextColor } = createPostDto
        const post = this.repository.create({ user: { id: userId }, content, template:{id : templateId}, templateTextColor });
        const savedPost = await this.repository.save(post)
        const savedPostWithTemplate = await this.repository.findOne({ where: { id: savedPost.id }, relations: ["template"] });
        console.log(savedPost)
        return this.createPostResponse(savedPostWithTemplate, [], createPostDto);
    }

    async createPost(userId: string, createPostDto: CreatePostDto, images: CreatedS3ImageFiles): Promise<PostCreateResponse> {
        const { content } = createPostDto
        const post = this.repository.create({ user: { id: userId }, content });
        const savedPost = await this.repository.save(post)
        const savedPostImages = await this.savePostImages(images, savedPost)
        return this.createPostResponse(savedPost, savedPostImages, createPostDto);
    }

    async createPostTags(userId: string, postId: string, hashTags: Hashtag[], isImagePost: boolean = true): Promise<void> {
        const postTags = hashTags.map((hashtag) => {
            return this.postTagsRepository.create({ user: { id: userId }, post: { id: postId }, hashtag: { id: hashtag.id }, isImagePost })
        })
        await this.postTagsRepository.save(postTags)
    }

    async setCountsToPosts(userId: string, posts: PostGetResponse[]): Promise<void> {
        if (posts?.length === 0) return;
        if(!posts) return;

        const postIds = posts.map(post => post.id);

        const likedCounts = await this.likedRepository.createQueryBuilder('liked')
            .select('liked.post_id', 'postId')
            .addSelect('COUNT(*)', 'count')
            .where('liked.post_id IN (:...postIds)', { postIds })
            .groupBy('liked.post_id')
            .getRawMany();

        const isUserLikedPosts = await this.likedRepository.createQueryBuilder('liked')
            .select('liked.post_id', 'postId')
            .where('liked.post_id IN (:...postIds)', { postIds })
            .andWhere('liked.user_id = :userId', { userId })
            .getRawMany();


        const commentCounts = await this.commentRepository.createQueryBuilder('comment')
            .select('comment.post_id', 'postId')
            .addSelect('COUNT(*)', 'count')
            .where('comment.post_id IN (:...postIds)', { postIds })
            .groupBy('comment.post_id')
            .getRawMany();

        const isUserCommentedPosts = await this.commentRepository.createQueryBuilder('comment')
            .select('comment.post_id', 'postId')
            .where('comment.post_id IN (:...postIds)', { postIds })
            .andWhere('comment.user_id = :userId', { userId })
            .getRawMany();


        for (const post of posts) {
            const likedCount = likedCounts.find(item => item.postId === post.id);
            post.likedCount = likedCount ? Number(likedCount.count) : 0;

            const commentCount = commentCounts.find(item => item.postId === post.id);
            post.commentCount = commentCount ? Number(commentCount.count) : 0;

            const isUserLikedPost = isUserLikedPosts.find(item => item.postId === post.id);
            post.isLiked = isUserLikedPost ? true : false;

            const isUserCommentedPost = isUserCommentedPosts.find(item => item.postId === post.id);
            post.isCommented = isUserCommentedPost ? true : false;
        }
    }

    async getComments(userId: string, postImageIds: string[]): Promise<Comment[]> {
        if (postImageIds.length === 0) return [];

        const comments = await this.commentRepository.query(`
            SELECT ranked_comments.*, user.id user_id, user.name user_name, user.profile_image_url user_profile_image_url
            FROM (
            SELECT
                comment.*,
                ROW_NUMBER() OVER (PARTITION BY post_image_id ORDER BY created_at DESC) as row_num
            FROM comment
            WHERE x IS NOT NULL AND is_public = true
            ) ranked_comments
            JOIN user ON ranked_comments.user_id = user.id
            WHERE (ranked_comments.row_num <= 10 OR ranked_comments.user_id = ?)
            AND post_image_id IN (?)
        `, [userId, postImageIds]);

        return comments.map((commentRow: any) => {
            const user: SnsBaseUser = {
                id: commentRow.user_id,
                name: commentRow.user_name,
                email: commentRow.user_email,
                profileImage: commentRow.user_profile_image_url
            };

            const comment = {
                id: commentRow.id,
                content: commentRow.content,
                x: commentRow.x,
                y: commentRow.y,
                user,
                createdAt: commentRow.created_at,
                updatedAt: commentRow.updated_at,
                deletedAt: commentRow.deleted_at,
                postImage: { id: commentRow.post_image_id }
            }
            return comment;
        })
    }

    async getCommentsForTemplate(userId: string, postIds: string[]): Promise<Comment[]> {
        if (postIds.length === 0) return [];

        const comments = await this.commentRepository.query(`
            SELECT ranked_comments.*, user.id user_id, user.name user_name, user.profile_image_url user_profile_image_url
            FROM (
            SELECT
                comment.*,
                ROW_NUMBER() OVER (PARTITION BY post_id ORDER BY created_at DESC) as row_num
            FROM comment
            WHERE is_public = true
            ) ranked_comments
            JOIN user ON ranked_comments.user_id = user.id
            WHERE (ranked_comments.row_num <= 10 OR ranked_comments.user_id = ?)
            AND post_id IN (?)
        `, [userId, postIds]);

        return comments.map((commentRow: any) => {
            const user: SnsBaseUser = {
                id: commentRow.user_id,
                name: commentRow.user_name,
                email: commentRow.user_email,
                profileImage: commentRow.user_profile_image_url
            };

            const comment = {
                id: commentRow.id,
                content: commentRow.content,
                x: commentRow.x,
                y: commentRow.y,
                user,
                createdAt: commentRow.created_at,
                updatedAt: commentRow.updated_at,
                deletedAt: commentRow.deleted_at,
                post: { id: commentRow.post_id }
            }
            return comment;
        })
    }

    createPostImageIdToCommentsMap(comments: Comment[]): Record<string, Comment[]> {
        return comments.reduce((map, comment) => {
            if (!map[comment.postImage.id]) {
                map[comment.postImage.id] = [];
            }

            const { postImage, ...parsedComment } = comment;
            map[comment.postImage.id].push(parsedComment);
            return map;
        }, {});
    }

    assignCommentsToPostImages(posts: PostGetResponse[], postImageIdToCommentsMap: Record<string, Comment[]>): void {
        for (const post of posts) {
            for (const postImage of post.images) {
                postImage.comments = postImageIdToCommentsMap[postImage.id] || [];
            }
        }
    }

    async addCommentsToPostImages(userId: string, posts: PostGetResponse[]): Promise<void> {
        if (!posts) return;
        if (posts.length === 0) return;

        const postImageIds = posts.flatMap(post => post.images.map(postImage => postImage.id));

        const comments = await this.getComments(userId, postImageIds);
        const postImageIdToCommentsMap = this.createPostImageIdToCommentsMap(comments);

        this.assignCommentsToPostImages(posts, postImageIdToCommentsMap);
    }

    mergeRawPostToPosts(rawPosts: RawPost[], rawHashTags: RawHashTag[], rawImages: RawImage[]): PostGetResponse[] {
        const posts: PostGetResponse[] = []

        rawPosts.forEach((rawPost) => {
            const user: PostUserResponse = {
                id: rawPost.user_id,
                name: rawPost.name,
                profileImage: rawPost.profile_image_url,
                isAllowFeedLike: rawPost.is_allow_feed_like,
                isAllowFeedComment: rawPost.is_allow_feed_comment,
                friendStatus: rawPost.friend_status
            }
            const post: PostGetResponse = {
                id: rawPost.id,
                user,
                content: rawPost.content,
                isTemplatePost: rawPost.template_id ? rawPost.template_text_color : null,
                images: [],
                hashTags: [],
                isLiked: false,
                isCommented: false,
                likedCount: 0,
                commentCount: 0,
                createdAt: rawPost.created_at,
                updatedAt: rawPost.updated_at,
            }
            posts.push(post)
        })

        rawHashTags.forEach((rawHashTag) => {
            //find post and push rawHashTag.content to post.hashTags
            const post = posts.find((post) => post.id === rawHashTag.post_id)
            if (post) {
                post.hashTags.push(rawHashTag.content)
            }
        })

        rawImages.forEach((rawImage) => {
            //find post and push rawImage to post.images
            const post = posts.find((post) => post.id === rawImage.post_id)
            if (post) {
                post.images.push({
                    id: rawImage.image_id,
                    originalName: rawImage.image_original_name,
                    url: getImageUrl(this.configService, rawImage.image_url),
                    mimeType: rawImage.image_mime_type,
                    comments: []
                })
            }
        })
        return posts
    }

    async addHashTagsAndImagesToRawPostsAndReturnPostGetResponseArray(posts: RawPost[]): Promise<PostGetResponse[]> {
        if (posts.length === 0) return;

        // Fetch hashtags for these posts
        const hashtagQuery = `
            SELECT post_tags.post_id, hashtag_id, hashtag.content, post_tags.created_at as post_tags_created_at
            FROM post_tags
            INNER JOIN hashtag
            ON post_tags.hashtag_id = hashtag.id
            WHERE post_tags.post_id IN (?)
            ORDER BY post_tags.created_at ASC
        `;
        const hashtags: RawHashTag[] = await this.repository.query(hashtagQuery, [posts.map(post => post.id)]);

        // Fetch images for these posts
        const imageQuery = `
            SELECT post_id, id as image_id, original_name as image_original_name, url as image_url, mime_type as image_mime_type, created_at as image_created_at
            FROM image
            WHERE post_id IN (?)
            ORDER BY image_created_at ASC
        `;

        const images: RawImage[] = await this.repository.query(imageQuery, [posts.map(post => post.id)]);
        return this.mergeRawPostToPosts(posts, hashtags, images);
    }


    async getFriendsStatusByUserId(userId: string): Promise<FriendStatusDictionary> {
        const userFriends = await this.friendRepository.query(`
            SELECT user.id, friend.status
            FROM friend
            LEFT JOIN user 
            ON user.id = CASE WHEN friend.requester_id = ? THEN friend.acceptor_id ELSE friend.requester_id END
            WHERE (friend.requester_id = ? OR friend.acceptor_id = ?)
            `,
            [userId, userId, userId]
        );

        const userFriendsDict = userFriends.reduce((dict, userFriend) => {
            dict[userFriend.id] = userFriend.status;
            return dict;
        }, {});

        return userFriendsDict
    }

    async getHidePostIdsByUserId(userId: string): Promise<string[]> {
        const rawHidedPosts = await this.likedRepository.query(`
            SELECT post_id
            FROM liked
            WHERE liked.user_id = ?
            AND liked.status IN (0, 1)
        `, [userId]);
        return rawHidedPosts.map((rawHidedPost) => rawHidedPost.post_id);
    }

    /* 진행중 */
    async getBlockedUserIdsByUserId(userId: string): Promise<string[]> {
        const rawBlockedUserIds = await this.friendRepository.query(`
            SELECT acceptor_id
            FROM friend
            WHERE requester_id = ?
            AND status = 400
        `, [userId]);

        console.log(rawBlockedUserIds)
        return rawBlockedUserIds.map((rawblockedUser) => rawblockedUser.acceptor_id);
    }

    async fetchAllPosts(userId: string, whereClause: string, 
        lastCreatedAt: string, limit: number, skip: number, 
        hidedPosts? : string[], rawBlockedUserIds? : string[]): Promise<PostGetResponse[]> {
        
        // Fetch posts with user information
        const postQuery = `
            SELECT post.*, user.name, user.email, user.profile_image_url, user.is_allow_feed_like, user.is_allow_feed_comment
            FROM post
            INNER JOIN user
            ON post.user_id = user.id
            WHERE post.created_at < ?
            AND ${whereClause}
            ${hidedPosts?.length > 0 ? 'AND post.id NOT IN (?)' : ''}
            ${rawBlockedUserIds?.length > 0 ? 'AND post.user_id NOT IN (?)' : ''}
            ORDER BY post.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const params = [lastCreatedAt, 
            ...(hidedPosts?.length > 0 ? [hidedPosts] : []), 
            ...(rawBlockedUserIds?.length > 0 ? [rawBlockedUserIds] : []), 
            limit, 
            skip];

        const posts: RawPost[] = await this.repository.query(postQuery, params);
        const userFriendsDict = await this.getFriendsStatusByUserId(userId);

        posts.forEach((post) => {
            const friendStatus = userFriendsDict[post.user_id];
            post.friend_status = friendStatus ? friendStatus : FriendStatus.NotFriends
        })

        if (posts.length === 0) return [];
        return await this.addHashTagsAndImagesToRawPostsAndReturnPostGetResponseArray(posts);
    }


    async fetchPostsByHashTag(userId: string, whereClause: string, 
        lastCreatedAt: string, limit: number, skip: number,
        hidedPosts? : string[], rawBlockedUserIds? : string[]
        ): Promise<PostGetResponse[]> {
        
        // Fetch posts with hashtag information
        const postQuery = `
            SELECT post.*, user.name, user.email, user.profile_image_url, user.is_allow_feed_like, user.is_allow_feed_comment, post_tags.hashtag_id
            FROM post_tags
            INNER join post
            ON post_tags.post_id = post.id
            INNER join user
            ON post_tags.user_id = user.id
            WHERE post.created_at < ?
            AND ${whereClause}
            ${hidedPosts?.length > 0 ? 'AND post.id NOT IN (?)' : ''}
            ${rawBlockedUserIds?.length > 0 ? 'AND post.user_id NOT IN (?)' : ''}
            ORDER BY post.created_at DESC
            LIMIT ? OFFSET ?
        `

        const params = [lastCreatedAt, 
            ...(hidedPosts?.length > 0 ? [hidedPosts] : []), 
            ...(rawBlockedUserIds?.length > 0 ? [rawBlockedUserIds] : []), 
            limit, 
            skip];

        const posts: RawPost[] = await this.repository.query(postQuery, params);
        const userFriendsDict = await this.getFriendsStatusByUserId(userId);

        posts.forEach((post) => {
            const friendStatus = userFriendsDict[post.user_id];
            post.friend_status = friendStatus ? friendStatus : FriendStatus.NotFriends
        })

        return await this.addHashTagsAndImagesToRawPostsAndReturnPostGetResponseArray(posts);
    }


    async countPosts(whereClause: string, lastCreatedAt: string, 
        hidedPosts? : string[], rawBlockedUserIds? : string[]): Promise<number> {
        
        const countQuery = `
            SELECT COUNT(*) as count
            FROM post
            INNER JOIN user
            ON post.user_id = user.id
            WHERE user.is_post_browsing_enabled = true
            AND post.created_at < ?
            AND ${whereClause}
            ${hidedPosts?.length > 0 ? 'AND post.id NOT IN (?)' : ''}
            ${rawBlockedUserIds?.length > 0 ? 'AND post.user_id NOT IN (?)' : ''}
            `;

        const params = [lastCreatedAt,
            ...(hidedPosts?.length > 0 ? [hidedPosts] : []),
            ...(rawBlockedUserIds?.length > 0 ? [rawBlockedUserIds] : []),
            ];
        
        
        const count: { count: number }[] = await this.repository.query(countQuery, params);
        return Number(count[0].count);
    }

    async countPostsByHashTag(whereClause: string, lastCreatedAt: string,
        hidedPosts? : string[], rawBlockedUserIds? : string[]
        ): Promise<number> {

        const countQuery = `
            SELECT count(distinct post.id) as count
            FROM post_tags
            INNER JOIN post
            ON post_tags.post_id = post.id
            INNER JOIN user
            ON post.user_id = user.id
            AND post.created_at < ?
            AND ${whereClause}
            ${hidedPosts?.length > 0 ? 'AND post.id NOT IN (?)' : ''}
            ${rawBlockedUserIds?.length > 0 ? 'AND post.user_id NOT IN (?)' : ''}
        `

        const params = [lastCreatedAt,
            ...(hidedPosts?.length > 0 ? [hidedPosts] : []),
            ...(rawBlockedUserIds?.length > 0 ? [rawBlockedUserIds] : []),
            ];

        const count: { count: number }[] = await this.repository.query(countQuery, params);
        return Number(count[0].count);
    }


    async addImangeAndCommentToTemplate(userId: string, posts: PostGetResponse[]){
        const templatePostIds = posts.filter((post) => post.isTemplatePost).map((post) => post.id)
        console.log(templatePostIds)

        if(templatePostIds.length > 0) {
            const templates = await this.repository.query(`
                SELECT post.id as post_id, template.id as image_id, original_name as image_original_name, url as image_url, mime_type as image_mime_type, template.created_at as image_created_at
                FROM post
                INNER JOIN template
                ON post.template_id = template.id
                WHERE post.id IN ('${templatePostIds.join("','")}')
            `)

            console.log(templates)
            templates.forEach((template) => {
                const post = posts.find((post) => post.id === template.post_id)
                post.images.push({
                    id: template.image_id,
                    originalName: template.image_original_name,
                    url: getImageUrl(this.configService, template.image_url),
                    mimeType: template.image_mime_type,
                    comments: [],
                })
            })
            // console.log(templates)

            //댓글 붙여주기
            const comments = await this.getCommentsForTemplate(userId, templatePostIds)
            comments.forEach(({post : commentPost, ...comment}) => {
                const curPost = posts.find((post) => post.id === commentPost.id)
                curPost.images[0].comments.push(comment)
            })
        }
    }

    //둘러보기(전체 게시물 보기) - 사진만
    async getPostsByPagination(userId: string, postPaginationDto: PostPaginationDto): Promise<GetPostsPaginationResponse> {
        const { page, limit, lastCreatedAt } = postPaginationDto;
        const skip = calculateSkip(page, limit)

        const whereClause = `template_id IS NULL AND user.is_post_browsing_enabled = true`

        /* 둘러보기에서 차단된 유저는 보여주지 않음 */
        const [hidedPosts, rawBlockedUserIds] = await Promise.all([
            this.getHidePostIdsByUserId(userId), 
            this.getBlockedUserIdsByUserId(userId)
        ]) 

        const [posts, count] = await Promise.all([
            this.fetchAllPosts(userId, whereClause, 
                lastCreatedAt, limit, skip, 
                hidedPosts, rawBlockedUserIds), 
            this.countPosts(whereClause, 
                lastCreatedAt,
                hidedPosts, rawBlockedUserIds)
        ])

        await Promise.all([
            this.setCountsToPosts(userId, posts), 
            this.addCommentsToPostImages(userId, posts)
        ])

        return {
            data: posts,
            pagination: createPaginationObject(count, limit, page)
        }
    }

    /* 둘러보기 해시태그 선택 */
    async getPostsFilterByHashTagIdAndPagination(userId: string, hashTagId: string, postPaginationDto: PostPaginationDto): Promise<GetPostsPaginationResponse> {
        const { page, limit, lastCreatedAt } = postPaginationDto;
        const skip = calculateSkip(page, limit)

        const whereClause = `template_id IS NULL AND post_tags.hashtag_id = '${hashTagId}' AND user.is_post_browsing_enabled = true`

        /* 둘러보기에서 차단된 유저는 보여주지 않음 */
        const [hidedPosts, rawBlockedUserIds] = await Promise.all([
            this.getHidePostIdsByUserId(userId), 
            this.getBlockedUserIdsByUserId(userId)
        ]) 

        const [posts, count] = await Promise.all([
            this.fetchPostsByHashTag(userId, whereClause, 
                lastCreatedAt, limit, skip,
                hidedPosts, rawBlockedUserIds
            ),
            this.countPostsByHashTag(
                whereClause, lastCreatedAt,
                hidedPosts, rawBlockedUserIds
            )])

        await Promise.all([this.setCountsToPosts(userId, posts), this.addCommentsToPostImages(userId, posts)])

        return {
            data: posts,
            pagination: createPaginationObject(count, limit, page)
        };
    }

    //특정 사용자 피드보기 - 템플릿 + 사진
    async getSpecificUserFeedByPagination(userId: string, specificUserId: string, postPaginationDto: PostPaginationDto): Promise<GetPostsPaginationResponse> {
        const { page, limit, lastCreatedAt } = postPaginationDto;
        const skip = calculateSkip(page, limit)

        const whereClause = `post.user_id = '${specificUserId}'`
        const [posts, count] = await Promise.all([
            this.fetchAllPosts(userId, whereClause, 
                lastCreatedAt, limit, skip
            ), 
            this.countPosts(
                whereClause, lastCreatedAt
            )
        ])
        await Promise.all([this.setCountsToPosts(userId, posts), this.addCommentsToPostImages(userId, posts), this.addImangeAndCommentToTemplate(userId, posts)])

        return {
            data: posts,
            pagination: createPaginationObject(count, limit, page)
        }
    }

    // 친구 피드보기 - 템플릿 + 사진 
    async getFollowingFeedByPagination(userId: string, postPaginationDto: PostPaginationDto) {
        const { page, limit, lastCreatedAt } = postPaginationDto;

        /* 둘러보기에서 차단된 유저는 보여주지 않음 */
        const [hidedPosts, rawBlockedUserIds] = await Promise.all([
            this.getHidePostIdsByUserId(userId), 
            this.getBlockedUserIdsByUserId(userId)
        ]) 

        const userFriends = await this.friendRepository.query(`
            SELECT user.id
            FROM friend
            LEFT JOIN user 
            ON user.id = CASE WHEN friend.requester_id = ? THEN friend.acceptor_id ELSE friend.requester_id END
            WHERE ((friend.requester_id = ? OR friend.acceptor_id = ?) AND friend.status = ?)
            `,
            [userId, userId, userId, FriendStatus.Friends]
        );
        
        const followingUserIds = userFriends.map((friend) => friend.id)
        // 친구 피드보기에서 내 피드도 같이 보여주기
        followingUserIds.push(userId)

        const skip = calculateSkip(page, limit)
        const whereClause = `post.user_id IN ('${followingUserIds.join("','")}')`
        const [posts, count] = await Promise.all([
            this.fetchAllPosts(userId, whereClause, 
                lastCreatedAt, limit, skip,
                hidedPosts, rawBlockedUserIds),
            this.countPosts(whereClause, lastCreatedAt,
                hidedPosts, rawBlockedUserIds)
        ])

        await Promise.all([
            this.setCountsToPosts(userId, posts), 
            this.addCommentsToPostImages(userId, posts), 
            this.addImangeAndCommentToTemplate(userId, posts)
        ])

        return {
            data: posts,
            pagination: createPaginationObject(count, limit, page)
        }
    }

    //특정 사용자 미디어(전체) 보기 - 사진만
    async getSpecificUserMediaByPagination(userId: string, specificUserId: string, postPaginationDto: PostPaginationDto): Promise<GetPostsPaginationResponse> {
        const { page, limit, lastCreatedAt } = postPaginationDto;

        const skip = calculateSkip(page, limit)

        const whereClause = `post.user_id = '${specificUserId}' AND template_id IS NULL`
        const [posts, count] = await Promise.all([this.fetchAllPosts(userId, whereClause, lastCreatedAt, limit, skip), this.countPosts(whereClause, lastCreatedAt)])
        await Promise.all([this.setCountsToPosts(userId, posts), this.addCommentsToPostImages(userId, posts)])

        return {
            data: posts,
            pagination: createPaginationObject(count, limit, page)
        }
    }

    //특정 사용자 미디어(해시태그 필터링) 보기 - 사진만
    async getSpecificUserMediaFilterByHashTagAndPagination(userId: string, specificUserId: string, hashTagId: string, postPaginationDto: PostPaginationDto): Promise<GetPostsPaginationResponse> {
        const { page, limit, lastCreatedAt } = postPaginationDto;

        const skip = calculateSkip(page, limit)

        const whereClause = `template_id IS NULL AND post_tags.hashtag_id = '${hashTagId}' AND post.user_id = '${specificUserId}'`
        const [posts, count] = await Promise.all([this.fetchPostsByHashTag(userId, whereClause, lastCreatedAt, limit, skip), this.countPostsByHashTag(whereClause, lastCreatedAt)])
        await Promise.all([this.setCountsToPosts(userId, posts), this.addCommentsToPostImages(userId, posts)])

        return {
            data: posts,
            pagination: createPaginationObject(count, limit, page)
        };
    }


    async updatePost(userId: string, postId: string, updatePostDto: UpdatePostDto): Promise<void> {
        const { content } = updatePostDto
        const updatedPost = await this.repository.update({ id: postId, user: { id: userId } }, { content })

        if (updatedPost.affected == 0) {
            throw new HttpException(
                'Post not found',
                HttpStatus.NOT_FOUND
            );
        }
    }

    async updateProfile(userId: string, updateProfileDto: Partial<UpdateProfileDto>): Promise<void> {
        //find user by name and if already exists that name is not user's name throw error
        const { name, introduction } = updateProfileDto

        if(isBadWord(name) || isBadWord(introduction)) {
            throw new HttpException(
                'Bad word',
                HttpStatus.FORBIDDEN
            );
        }

        if(name === '하루' || name === '하기' || name === '루리' || name.toLowerCase() === 'haru' || name === ''){
            throw new HttpException(
                'Bad word',
                HttpStatus.FORBIDDEN
            );
        }

        await this.userRepository.update({ id: userId }, { ...updateProfileDto });
    }

    async deletePost(userId: string, postId: string): Promise<void> {
        const deleted = await this.repository.delete({ id: postId, user: { id: userId } })

        if (deleted.affected == 0) {
            throw new HttpException(
                'Post not found',
                HttpStatus.NOT_FOUND
            );
        }
    }

    async createProfileImage(userId: string, image: CreatedS3ImageFile): Promise<ImageResponse> {
        const { originalName, key, contentType, size } = image.uploadedFile

        const profileImage = new Image()
        profileImage.originalName = originalName
        profileImage.url = key
        profileImage.mimeType = contentType
        profileImage.size = size
        profileImage.user = new User({ id: userId })

        const savedProfileImage = await this.imageRepository.save(profileImage)
        return {
            id: savedProfileImage.id,
            originalName,
            url: this.S3_URL + key,
            mimeType: contentType,
        }
    }

    async getProfileImagesByUserId(userId: string): Promise<ImageResponse[]> {
        const images = await this.imageRepository.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } })
        return images.map(({ id, originalName, url, mimeType }) => ({ id, originalName, url: this.S3_URL + url, mimeType }))
    }

    async getHashtags(): Promise<BaseHashTag[]> {
        // get postTags that made in recent 1 day and group by hashtag and rank by count
        const postTags = await this.postTagsRepository.createQueryBuilder('posttags')
            .select(['hashtag.id', 'hashtag.content', 'COUNT(hashtag.id) AS count'])
            .innerJoin('posttags.hashtag', 'hashtag')
            .where('posttags.createdAt > :date', { date: new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 7) })
            .andWhere('posttags.is_image_post = true')
            .groupBy('hashtag.id')
            .addGroupBy('hashtag.content')
            .orderBy('count', 'DESC')
            .getRawMany();

        return postTags.map(({ hashtag_id, hashtag_content }) => ({ id: hashtag_id, content: hashtag_content }));
    }

    async getHashtagsByUserId(userId: string): Promise<BaseHashTag[]> {
        // get postTags that group by hashtag and rank by count and also filter by userId
        const postTags = await this.postTagsRepository.createQueryBuilder('posttags')
            .select(['hashtag.id', 'hashtag.content', 'COUNT(hashtag.id) AS count'])
            .innerJoin('posttags.hashtag', 'hashtag')
            .where('posttags.user = :userId', { userId })
            .andWhere('posttags.is_image_post = true')
            .groupBy('hashtag.id')
            .addGroupBy('hashtag.content')
            .orderBy('count', 'DESC')
            .getRawMany();
            
        //filter postTags that count is 0
        return postTags.filter(({ count }) => count > 0).map(({ hashtag_id, hashtag_content }) => ({ id: hashtag_id, content: hashtag_content }));
    }


    async getUserInfo(userId: string, specificUserId: string): Promise<UserInfoResponse> {
        const result = await this.userRepository.manager.query(`
            SELECT user.name, user.introduction, user.profile_image_url AS profileImage, user.is_public_account AS isPublicAccount,
                (SELECT COUNT(friend.id)
                    FROM friend
                    WHERE ((friend.requester_id = user.id OR friend.acceptor_id = user.id) AND friend.status = 2)) AS friendCount,
                (SELECT COUNT(post.id)
                    FROM post
                    WHERE post.user_id = user.id
                    AND post.deleted_at IS NULL) AS postCount
            FROM user
            WHERE user.id = ?
            AND user.deleted_at IS NULL
        `, [specificUserId, userId, specificUserId]);


        // const friendStatus = await this.friendRepository
        //     .createQueryBuilder('friend')
        //     .select(['friend.status', 'friend.requester_id', 'friend.acceptor_id'])
        //     .where('(friend.requester_id = :userId AND friend.acceptor_id = :specificUserId) \
        //     OR (friend.requester_id = :specificUserId AND friend.acceptor_id = :userId)',
        //         { userId: userId, specificUserId: specificUserId })
        //     .getOne();

        const friendInfo = await this.friendRepository.query(`
        SELECT user.id, user.name, user.email, user.profile_image_url, friend.status, friend.requester_id, friend.acceptor_id, friend.created_at
        FROM friend
        LEFT JOIN user
        ON user.id = CASE WHEN friend.requester_id = ? THEN friend.acceptor_id ELSE friend.requester_id END
        WHERE ((friend.requester_id = ? AND friend.acceptor_id = ?) OR (friend.requester_id = ? AND friend.acceptor_id = ?))
        `,
            [userId, userId, specificUserId, specificUserId, userId]
        );

        var friendStatus = friendInfo.length == 0 ? 0 : friendInfo[0].status;
        if(friendStatus == 1){
            if(friendInfo[0].acceptor_id == userId){
                friendStatus = 3;
            }
        }
        
        if(friendStatus == 400){
            friendStatus = 0;
        }

        if (result.length == 0) {
            throw new HttpException(
                'User not found',
                HttpStatus.NOT_FOUND
            );
        }

        return {
            id: specificUserId,
            name: result[0].name,
            introduction: result[0].introduction,
            profileImage: result[0].profileImage,
            postCount: Number(result[0].postCount),
            friendCount: Number(result[0].friendCount),
            friendStatus,
            isPublicAccount : result[0].isPublicAccount ? true : false
        }
    }

    async getUserByHaruId(userId: string, haruId: string): Promise<UserInfoResponse> {
        const user = await this.userRepository.manager.query(`
            SELECT user.id, user.name, user.introduction, user.profile_image_url AS profileImage
            FROM user
            WHERE user.haru_id = ?
            AND user.deleted_at IS NULL
        `, [haruId]);

        if (user.length == 0) {
            throw new HttpException(
                'User not found',
                HttpStatus.NOT_FOUND
            );
        }
        return await this.getUserInfo(userId, user[0].id)
    }


    async likePost(userId: string, postId: string): Promise<void> {
        //if user already liked the post, then delete like and return, else create like
        const like = await this.likedRepository.findOne({ where: { user: { id: userId }, post: { id: postId } } })
        if (like) {
            await this.likedRepository.delete({ id: like.id })
            return
        }
        const newLike = this.likedRepository.create({ user: { id: userId }, post: { id: postId } })
        await this.likedRepository.save(newLike)
    }

    async reportPost(userId: string, postId: string): Promise<void> {
        //if user already reported the post, then delete report and return, else create report
        await this.likedRepository.delete({ user: { id: userId }, post: { id: postId } })

        const count = await this.likedRepository.count({ where: { post: { id: postId }, status: 0 } })
        if (count >= 2) {
            await this.repository.delete({ id: postId })
            return
        }

        const newReport = this.likedRepository.create({ user: { id: userId }, post: { id: postId }, status: 0 })
        await this.likedRepository.save(newReport)
    }

    async hidePost(userId: string, postId: string): Promise<void> {
        //if user already reported the post, then delete report and return, else create report
        await this.likedRepository.delete({ user: { id: userId }, post: { id: postId } })
        const newHide = this.likedRepository.create({ user: { id: userId }, post: { id: postId }, status: 1 })
        await this.likedRepository.save(newHide)
    }

    
}