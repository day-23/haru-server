import { HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { CreatedS3ImageFile, CreatedS3ImageFiles } from "src/aws/interface/awsS3.interface";
import { PaginationDto, createPaginationObject } from "src/common/dto/pagination.dto";
import { Hashtag } from "src/entity/hashtag.entity";
import { Image } from "src/entity/image.entity";
import { Liked } from "src/entity/liked.entity";
import { PostTags } from "src/entity/post-tags.entity";
import { Post } from "src/entity/post.entity";
import { User } from "src/entity/user.entity";
import { CreatePostDto, UpdatePostDto } from "src/posts/dto/create.post.dto";
import { PostImageResponse } from "src/posts/interface/post-image.interface";
import { BaseHashTag, GetPostsPaginationResponse, PostCreateResponse, PostGetResponse } from "src/posts/interface/post.interface";
import { Repository } from "typeorm";

export class PostRepository {
    public readonly S3_URL: string;

    constructor(@InjectRepository(Post) private readonly repository: Repository<Post>,
        @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
        @InjectRepository(PostTags) private readonly postTagsRepository: Repository<PostTags>,
        @InjectRepository(Liked) private readonly likedRepository: Repository<Liked>,
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
            images: savedPostImages.map(({ id, originalName, url, mimeType }) => ({ id, originalName, url: this.S3_URL + url, mimeType })),
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
            images: post.postImages.map(({ id, originalName, url, mimeType }) => ({
                id,
                originalName,
                url: this.S3_URL + url,
                mimeType,
            })),
            hashTags: post.postTags.map(({ hashtag }) => hashtag.content),
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
        };
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
            .skip(skip)
            .take(limit)
            .orderBy('post.createdAt', 'DESC')
            .addOrderBy('posttags.createdAt', 'ASC')
            .getManyAndCount();

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
            .where('user.id = :specificUserId', { specificUserId })
            .skip(skip)
            .take(limit)
            .orderBy('post.createdAt', 'DESC')
            .addOrderBy('posttags.createdAt', 'ASC')
            .getManyAndCount();

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
            .where('user.id = :specificUserId', { specificUserId })
            .skip(skip)
            .take(limit)
            .orderBy('post.createdAt', 'DESC')
            .addOrderBy('posttags.createdAt', 'ASC')
            .getManyAndCount();

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

    async deletePost(userId: string, postId: string): Promise<void> {
        const deleted = await this.repository.delete({ id: postId, user: { id: userId } })

        if (deleted.affected == 0) {
            throw new HttpException(
                'Post not found',
                HttpStatus.NOT_FOUND
            );
        }
    }

    async createProfileImage(userId: string, image: CreatedS3ImageFile): Promise<PostImageResponse> {
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

    async getProfileImagesByUserId(userId: string): Promise<PostImageResponse[]> {
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

}