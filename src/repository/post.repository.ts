import { HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { CreatedS3ImageFile, CreatedS3ImageFiles } from "src/aws/interface/awsS3.interface";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Image } from "src/entity/image.entity";
import { Post } from "src/entity/post.entity";
import { User } from "src/entity/user.entity";
import { CreatePostDto, UpdatePostDto } from "src/posts/dto/create.post.dto";
import { GetPostsPaginationResponse, PostCreateResponse } from "src/posts/interface/post.interface";
import { Repository } from "typeorm";

export class PostRepository {
    public readonly S3_URL: string;

    constructor(@InjectRepository(Post) private readonly repository: Repository<Post>,
            @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
            private readonly configService: ConfigService
    ) {
        this.S3_URL = this.configService.get('AWS_S3_URL'); // nest-s3
     }

    async createPost(userId: string, createPostDto: CreatePostDto, images : CreatedS3ImageFiles): Promise<PostCreateResponse> {
        const { content } = createPostDto
        const post = this.repository.create({ user: { id: userId }, content })
        const savedPost = await this.repository.save(post)

        const postImages = []

        images.uploadedFiles.map((image) => {
            const postImage = new Image()
            postImage.post = savedPost
            postImage.originalName = image.originalName
            postImage.url = image.key
            postImage.mimeType = image.contentType
            postImage.size = image.size
            postImages.push(postImage)
        })

        const savedPostImages = await this.imageRepository.save(postImages)
        console.log(savedPostImages)

        const ret = {
            id: savedPost.id,
            images : savedPostImages.map(({id, originalName, url, mimeType}) => ({id, originalName, url: this.S3_URL+ url, mimeType}) ),
            content: savedPost.content,
            createdAt: savedPost.createdAt,
            updatedAt: savedPost.updatedAt
        }
        return ret
    }

    async getPostsByPagination(userId: string, paginationDto: PaginationDto): Promise<GetPostsPaginationResponse> {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit

        const [posts, count] = await this.repository.createQueryBuilder('post')
            .innerJoinAndSelect('post.postImages', 'postimage')
            .innerJoinAndSelect('post.user', 'user')
            .skip(skip)
            .take(limit)
            .orderBy('post.createdAt', 'DESC')
            .getManyAndCount();

        const totalPages = Math.ceil(count / limit);

        return {
            data: posts.map(post => ({
                id: post.id,
                user: { id : post.user.id , name : post.user.name },
                content: post.content,
                images: post.postImages.map(({ id, originalName, url, mimeType}) => ({
                    id, originalName, url : this.S3_URL + url, mimeType
                })),
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            })),
            pagination: {
                totalItems: count,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: totalPages,
            },
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



    async createProfileImage(userId: string, image: CreatedS3ImageFile){
        const { originalName, key, contentType, size } = image.uploadedFile

        const profileImage = new Image()
        profileImage.originalName = originalName
        profileImage.url = key
        profileImage.mimeType = contentType
        profileImage.size = size
        profileImage.user = new User({ id: userId })

        const savedProfileImage = await this.imageRepository.save(profileImage)
        return {...savedProfileImage}
    }
}