import { InjectRepository } from "@nestjs/typeorm";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Post } from "src/entity/post.entity";
import { CreatePostDto, UpdatePostDto } from "src/posts/dto/create.post.dto";
import { GetPostsPaginationResponse, PostCreateResponse } from "src/posts/interface/post.interface";
import { Repository } from "typeorm";

export class PostRepository {
    constructor(@InjectRepository(Post) private readonly repository: Repository<Post>) { }

    async createPost(userId: string, createPostDto: CreatePostDto): Promise<PostCreateResponse> {
        const { content } = createPostDto
        const post = this.repository.create({ user: { id: userId }, content })

        const savedPost = await this.repository.save(post)
        return savedPost
    }

    async getPostsByPagination(userId: string, paginationDto: PaginationDto): Promise<GetPostsPaginationResponse> {
        const { page, limit } = paginationDto;
        const [posts, count] = await this.repository.findAndCount({
            take: limit,
            skip: (page - 1) * limit,
            order: { createdAt: "DESC" }
        });

        const totalPages = Math.ceil(count / limit);
        return {
            data: posts.map(post => ({
                id: post.id,
                user: post.user,
                content: post.content,
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
        const updatedPost = await this.repository.update({ id: postId }, { content })
    }

    async deletePost(userId: string, postId: string): Promise<void> {
        const updatedPost = await this.repository.delete({ id: postId, user: { id: userId } })
    }

}