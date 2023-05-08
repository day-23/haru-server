import { HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { CreatedS3ImageFile, CreatedS3ImageFiles } from "src/aws/interface/awsS3.interface";
import { PaginationDto, createPaginationObject } from "src/common/dto/pagination.dto";
import { Comment } from "src/entity/comment.entity";
import { Hashtag } from "src/entity/hashtag.entity";
import { Image } from "src/entity/image.entity";
import { Liked } from "src/entity/liked.entity";
import { PostTags } from "src/entity/post-tags.entity";
import { Post } from "src/entity/post.entity";
import { User } from "src/entity/user.entity";
import { SnsBaseUser } from "src/follows/interface/follow.user.interface";
import { CreatePostDto, UpdatePostDto } from "src/posts/dto/create.post.dto";
import { ImageResponse } from "src/posts/interface/post-image.interface";
import { BaseHashTag, GetPostsPaginationResponse, PostCreateResponse, PostGetResponse, PostUserResponse } from "src/posts/interface/post.interface";
import { Repository } from "typeorm";
import { UserInfoResponse } from "./interface/user-info.interface";
import { Report } from "src/entity/report.entity";
import { UpdateProfileDto } from "src/users/dto/profile.dto";

export class PostRepository {
    public readonly S3_URL: string;

    constructor(
        @InjectRepository(Post) private readonly repository: Repository<Post>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
        @InjectRepository(PostTags) private readonly postTagsRepository: Repository<PostTags>,
        @InjectRepository(Liked) private readonly likedRepository: Repository<Liked>,
        @InjectRepository(Comment) private readonly commentRepository: Repository<Comment>,
        @InjectRepository(Report) private readonly reportRepository: Repository<Report>,
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
        return {
            id: savedPost.id,
            images: savedPostImages.map(({ id, originalName, url, mimeType }) => ({ id, originalName, url: this.S3_URL + url, mimeType, comments:[] })),
            hashTags: createPostDto.hashTags,
            content: savedPost.content,
            createdAt: savedPost.createdAt,
            updatedAt: savedPost.updatedAt,
        };
    }

    async createPost(userId: string, createPostDto: CreatePostDto, images: CreatedS3ImageFiles): Promise<PostCreateResponse> {
        const { content } = createPostDto
        const post = this.repository.create({ user: { id: userId }, content });
        const savedPost = await this.repository.save(post)
        const savedPostImages = await this.savePostImages(images, savedPost)
        return this.createPostResponse(savedPost, savedPostImages, createPostDto);
    }

    async createPostTags(userId: string, postId: string, hashTags: Hashtag[]): Promise<void> {
        const postTags = hashTags.map((hashtag) => {
            return this.postTagsRepository.create({ user: { id: userId }, post: { id: postId }, hashtag: { id: hashtag.id } })
        })
        await this.postTagsRepository.save(postTags)
    }

    createPostData(post: Post) : PostGetResponse {
        return {
            id: post.id,
            user: {
                id: post.user.id,
                name: post.user.name,
                profileImage: post.user?.profileImages.length > 0 ? this.S3_URL + post.user?.profileImages[0].url : null,
            },
            content: post.content,
            images: post.postImages.map(({ id, originalName, url, mimeType, comments }) => ({
                id,
                originalName,
                url: this.S3_URL + url,
                mimeType,
                comments
            })),
            hashTags: post.postTags.map(({ hashtag }) => hashtag.content),
            isLiked: post.liked.length > 0 ? true : false,
            isCommented : post.comments.length > 0 ? true : false,
            likedCount: post.likedCount,
            commentCount: post.commentCount,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
        };
    }

    async setCountsToPosts(posts: Post[]) : Promise<void> {
        const postIds = posts.map(post => post.id);

        const likedCounts = await this.likedRepository.createQueryBuilder('liked')
            .select('liked.post_id', 'postId')
            .addSelect('COUNT(*)', 'count')
            .where('liked.post_id IN (:...postIds)', { postIds })
            .groupBy('liked.post_id')
            .getRawMany();

        const commentCounts = await this.commentRepository.createQueryBuilder('comment')
            .select('comment.post_id', 'postId')
            .addSelect('COUNT(*)', 'count')
            .where('comment.post_id IN (:...postIds)', { postIds })
            .groupBy('comment.post_id')
            .getRawMany();

        for (const post of posts) {
            const likedCount = likedCounts.find(item => item.postId === post.id);
            post.likedCount = likedCount ? Number(likedCount.count) : 0;

            const commentCount = commentCounts.find(item => item.postId === post.id);
            post.commentCount = commentCount ? Number(commentCount.count) : 0;
        }
    }

    async getComments(postImageIds : string[]) : Promise<Comment[]> {
        const comments = await this.commentRepository.query(`
            SELECT ranked_comments.*, user.id user_id, user.name user_name, image.url user_profile_image_url
            FROM (
            SELECT
                comment.*,
                ROW_NUMBER() OVER (PARTITION BY post_image_id ORDER BY created_at DESC) as row_num
            FROM comment
            WHERE x IS NOT NULL
            ) ranked_comments
            JOIN user ON ranked_comments.user_id = user.id
            LEFT JOIN (
            SELECT i1.*
            FROM image i1
            INNER JOIN (
                SELECT user_id, MAX(created_at) as latest_created_at
                FROM image
                GROUP BY user_id
            ) i2 ON i1.user_id = i2.user_id AND i1.created_at = i2.latest_created_at
            ) image ON user.id = image.user_id
            WHERE ranked_comments.row_num <= 10
            AND post_image_id IN (?)
        `, [postImageIds]);

        return comments.map((commentRow: any) => {
            const user : SnsBaseUser = {
                id : commentRow.user_id,
                name : commentRow.user_name,
                email : commentRow.user_email,
                profileImage : commentRow.user_profile_image_url ? this.S3_URL + commentRow.user_profile_image_url : null,
            };

            const comment = {
                id : commentRow.id,
                content : commentRow.content,
                x : commentRow.x,
                y : commentRow.y,
                user,
                createdAt : commentRow.created_at,
                updatedAt : commentRow.updated_at,
                deletedAt : commentRow.deleted_at,
                postImage : { id : commentRow.post_image_id }
            }
            return comment;
        })
    }

    createPostImageIdToCommentsMap(comments: Comment[]): Record<string, Comment[]> {
        return comments.reduce((map, comment) => {
            if (!map[comment.postImage.id]) {
                map[comment.postImage.id] = [];
            }

            const {postImage, ...parsedComment} = comment;
            map[comment.postImage.id].push(parsedComment);
            return map;
        }, {});
    }

    assignCommentsToPostImages(posts: Post[], postImageIdToCommentsMap: Record<string, Comment[]>): void {
        for (const post of posts) {
            for (const postImage of post.postImages) {
                postImage.comments = postImageIdToCommentsMap[postImage.id] || [];
            }
        }
    }

    async addCommentsToPostImages(posts: Post[]): Promise<void> {
        const postImageIds = posts.flatMap(post => post.postImages.map(postImage => postImage.id));

        const comments = await this.getComments(postImageIds);
        const postImageIdToCommentsMap = this.createPostImageIdToCommentsMap(comments);

        this.assignCommentsToPostImages(posts, postImageIdToCommentsMap);
    }


    async getPostsByPagination(userId: string, paginationDto: PaginationDto): Promise<GetPostsPaginationResponse> {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit

        const [posts, count] = await this.repository.createQueryBuilder('post')
            .innerJoinAndSelect('post.postImages', 'postimage')
            .innerJoin('post.user', 'user')
            .addSelect(['user.id', 'user.name', 'user.email'])
            .leftJoinAndSelect('user.profileImages', 'profileImages')
            .leftJoinAndSelect('post.postTags', 'posttags')
            .leftJoinAndSelect('posttags.hashtag', 'hashtag')
            .leftJoin('post.liked', 'liked', 'liked.user = :userId', { userId })
            .addSelect(['liked.id'])
            .leftJoin('post.comments', 'comment', 'comment.user = :userId', { userId })
            .addSelect(['comment.id'])
            .skip(skip)
            .take(limit)
            .orderBy('post.createdAt', 'DESC')
            .addOrderBy('posttags.createdAt', 'ASC')
            .getManyAndCount();

        console.log(posts)

        await Promise.all([this.setCountsToPosts(posts), this.addCommentsToPostImages(posts)])

        return {
            data: posts.map((post) => this.createPostData(post)),
            pagination: createPaginationObject(count, limit, page)
        };
    }


    async getPostsFilterByHashTagIdAndPagination(userId : string, hashTagId : string, paginationDto: PaginationDto): Promise<GetPostsPaginationResponse> {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit

        //get posts that include the hashtagId and also include other hashtags not only the hashtagId
        const [posts, count] = await this.repository.createQueryBuilder('post')
            .innerJoinAndSelect('post.postImages', 'postimage')
            .innerJoin('post.user', 'user')
            .addSelect(['user.id', 'user.name', 'user.email'])
            .leftJoinAndSelect('user.profileImages', 'profileImages')
            .leftJoinAndSelect('post.postTags', 'posttags')
            .leftJoinAndSelect('posttags.hashtag', 'hashtag')
            .leftJoin('post.liked', 'liked', 'liked.user = :userId', { userId })
            .addSelect(['liked.id'])
            .where(qb => {
                const subQuery = qb.subQuery()
                    .select('postTag.post')
                    .from('post_tags', 'postTag')
                    .leftJoin('postTag.hashtag', 'hashtag')
                    .where('hashtag.id = :hashTagId', { hashTagId })
                    .getQuery();
                return 'post.id IN ' + subQuery;
            })
            .skip(skip)
            .take(limit)
            .orderBy('post.createdAt', 'DESC')
            .addOrderBy('posttags.createdAt', 'ASC')
            .getManyAndCount();
        await Promise.all([this.setCountsToPosts(posts), this.addCommentsToPostImages(posts)])

        return {
            data: posts.map((post) => this.createPostData(post)),
            pagination: createPaginationObject(count, limit, page)
        };
    }


    async getSpecificUserFeedByPagination(userId: string, specificUserId: string, paginationDto: PaginationDto): Promise<GetPostsPaginationResponse> {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit

        const [posts, count] = await this.repository.createQueryBuilder('post')
            .leftJoinAndSelect('post.postImages', 'postimage')
            .innerJoin('post.user', 'user')
            .addSelect(['user.id', 'user.name', 'user.email'])
            .leftJoinAndSelect('user.profileImages', 'profileImages')
            .leftJoinAndSelect('post.postTags', 'posttags')
            .leftJoinAndSelect('posttags.hashtag', 'hashtag')
            .leftJoin('post.liked', 'liked', 'liked.user = :userId', { userId })
            .addSelect(['liked.id'])
            .where('user.id = :specificUserId', { specificUserId })
            .skip(skip)
            .take(limit)
            .orderBy('post.createdAt', 'DESC')
            .addOrderBy('posttags.createdAt', 'ASC')
            .getManyAndCount();

        await Promise.all([this.setCountsToPosts(posts), this.addCommentsToPostImages(posts)])

        return {
            data: posts.map((post) => this.createPostData(post)),
            pagination: createPaginationObject(count, limit, page)
        };
    }

    async getSpecificUserMediaByPagination(userId: string, specificUserId: string, paginationDto: PaginationDto): Promise<GetPostsPaginationResponse> {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit

        const [posts, count] = await this.repository.createQueryBuilder('post')
            .innerJoinAndSelect('post.postImages', 'postimage')
            .innerJoin('post.user', 'user')
            .addSelect(['user.id', 'user.name', 'user.email'])
            .leftJoinAndSelect('user.profileImages', 'profileImages')
            .leftJoinAndSelect('post.postTags', 'posttags')
            .leftJoinAndSelect('posttags.hashtag', 'hashtag')
            .leftJoin('post.liked', 'liked', 'liked.user = :userId', { userId })
            .addSelect(['liked.id'])
            .where('user.id = :specificUserId', { specificUserId })
            .skip(skip)
            .take(limit)
            .orderBy('post.createdAt', 'DESC')
            .addOrderBy('posttags.createdAt', 'ASC')
            .getManyAndCount();
        
        await Promise.all([this.setCountsToPosts(posts), this.addCommentsToPostImages(posts)])

        return {
            data: posts.map((post) => this.createPostData(post)),
            pagination: createPaginationObject(count, limit, page)
        };
    }

    async getSpecificUserMediaFilterByHashTagAndPagination(userId: string, specificUserId: string, hashTagId: string, paginationDto: PaginationDto): Promise<GetPostsPaginationResponse> {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit

        const [posts, count] = await this.repository.createQueryBuilder('post')
            .innerJoinAndSelect('post.postImages', 'postimage')
            .innerJoin('post.user', 'user')
            .addSelect(['user.id', 'user.name', 'user.email'])
            .leftJoinAndSelect('user.profileImages', 'profileImages')
            .leftJoinAndSelect('post.postTags', 'posttags')
            .leftJoinAndSelect('posttags.hashtag', 'hashtag')
            .leftJoin('post.liked', 'liked', 'liked.user = :userId', { userId })
            .addSelect(['liked.id'])
            .where('user.id = :specificUserId', { specificUserId })
            .andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select('postTag.post')
                    .from('post_tags', 'postTag')
                    .leftJoin('postTag.hashtag', 'hashtag')
                    .where('hashtag.id = :hashTagId', { hashTagId })
                    .getQuery();
                return 'post.id IN ' + subQuery;
            })
            .skip(skip)
            .take(limit)
            .orderBy('post.createdAt', 'DESC')
            .addOrderBy('posttags.createdAt', 'ASC')
            .getManyAndCount();
        
        await Promise.all([this.setCountsToPosts(posts), this.addCommentsToPostImages(posts)])

        return {
            data: posts.map((post) => this.createPostData(post)),
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

    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<void> {
        //find user by name and if already exists that name is not user's name throw error
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
            .where('posttags.createdAt > :date', { date: new Date(new Date().getTime() - 24 * 60 * 60 * 1000) })
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
            .groupBy('hashtag.id')
            .addGroupBy('hashtag.content')
            .orderBy('count', 'DESC')
            .getRawMany();

        return postTags.map(({ hashtag_id, hashtag_content }) => ({ id: hashtag_id, content: hashtag_content }));
    }

    // 여기 해야함
    async getUserInfo(userId: string, specificUserId : string): Promise<UserInfoResponse> {
        const result = await this.userRepository.manager.query(`
            SELECT user.name, user.introduction,
                (SELECT image.url
                    FROM image
                    WHERE image.user_id = user.id
                    ORDER BY image.created_at DESC
                    LIMIT 1) AS profileImage,
                (SELECT COUNT(following.id)
                    FROM user_relationship following
                    WHERE following.following_id = user.id) AS followingCount,
                (SELECT COUNT(follower.id)
                    FROM user_relationship follower
                    WHERE follower.follower_id = user.id) AS followerCount,
                (SELECT COUNT(post.id)
                    FROM post
                    WHERE post.user_id = user.id
                    AND post.deleted_at IS NULL) AS postCount,
                (SELECT COUNT(user_relationship.follower_id)
                    FROM user_relationship
                    WHERE ((user_relationship.follower_id = ?) AND (user_relationship.following_id = ?))
                    ) AS isFollowing
            FROM user
            WHERE user.id = ?
            AND user.deleted_at IS NULL
        `, [specificUserId, userId, userId]);

        if (result.length == 0) {
            throw new HttpException(
                'User not found',
                HttpStatus.NOT_FOUND
            );
        }

        return {
            id : userId,
            name : result[0].name,
            introduction : result[0].introduction,
            profileImage : result[0].profileImage ? this.S3_URL + result[0].profileImage : null,
            isFollowing : result[0].isFollowing > 0 ? true : false,
            postCount : Number(result[0].postCount),
            followerCount : Number(result[0].followerCount),
            followingCount : Number(result[0].followingCount),
        }
    }

    async getUserByEmail(userId: string, email: string) : Promise<PostUserResponse>{
        const result = await this.userRepository.manager.query(`
            SELECT user.name, user.introduction,
                (SELECT image.url
                    FROM image
                    WHERE image.user_id = user.id
                    ORDER BY image.created_at DESC
                    LIMIT 1) AS profileImage
            FROM user
            WHERE user.email = ?
            AND user.deleted_at IS NULL
        `, [email]);

        if (result.length == 0) {
            throw new HttpException(
                'User not found',
                HttpStatus.NOT_FOUND
            );
        }

        return {
            id : userId,
            name : result[0].name,
            profileImage : result[0].profileImage ? this.S3_URL + result[0].profileImage : null
        }
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
        const report = await this.reportRepository.findOne({ where: { user: { id: userId }, post: { id: postId } } })
        if (report) {
            return
        }

        const count = await this.reportRepository.count({ where: { post: { id: postId } } })
        if (count >= 2) {
            await this.repository.delete({ id: postId })
            return
        }

        const newReport = this.reportRepository.create({ user: { id: userId }, post: { id: postId } })
        await this.reportRepository.save(newReport)
    }
}