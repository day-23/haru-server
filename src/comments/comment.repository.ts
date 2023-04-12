import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateCommentDto, UpdateCommentDto } from "src/comments/dto/create.comment.dto";
import { CommentCreateResponse, GetCommentsPaginationResponse } from "src/comments/interface/comment.interface";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Comment } from "src/entity/comment.entity";
import { Repository } from "typeorm";

export class CommentRepository {
    constructor(@InjectRepository(Comment) private readonly repository: Repository<Comment>) { }

    async createComment(userId: string, postId: string, postImageId: string, createCommentDto: CreateCommentDto): Promise<CommentCreateResponse> {    
        const { content, x, y } = createCommentDto
        const comment = this.repository.create({ user: { id: userId }, post: { id: postId }, postImage: postImageId ? { id: postImageId } : undefined, content, x, y })

        const savedComment = await this.repository.save(comment)
        
        const ret = {
            id: savedComment.id,
            content: savedComment.content,
            x,
            y,
            createdAt: savedComment.createdAt,
            updatedAt: savedComment.updatedAt
        }
        return ret
    }

    async getCommentsByPagination(userId: string, paginationDto: PaginationDto): Promise<GetCommentsPaginationResponse> {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;

        const [comments, count] = await this.repository.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.user', 'user')
            .skip(skip)
            .take(limit)
            .select(['comment.id', 'comment.content', 'comment.x', 'comment.y', 'comment.createdAt', 'comment.updatedAt'])
            .addSelect(['user.id', 'user.name'])
            .orderBy('comment.createdAt', 'DESC')
            .getManyAndCount();

        const totalPages = Math.ceil(count / limit);
        return {
            data: comments.map(comment => ({
                id: comment.id,
                user: comment.user,
                content: comment.content,
                x : comment.x,
                y : comment.y,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt
            })),
            pagination: {
                totalItems: count,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: totalPages,
            },
        };
    }

    async updateComment(userId: string, commentId: string, updateCommentDto: UpdateCommentDto): Promise<void> {
        const { content } = updateCommentDto
        const updatedComment = await this.repository.update({ id: commentId, user: { id: userId } }, { content })

        if (updatedComment.affected == 0) {
            throw new HttpException(
                'Comment not found',
                HttpStatus.NOT_FOUND
            );
        }
    }

    async deleteComment(userId: string, commentId: string): Promise<void> {
        const deleted = await this.repository.delete({ id: commentId, user: { id: userId } })

        if (deleted.affected == 0) {
            throw new HttpException(
                'Comment not found',
                HttpStatus.NOT_FOUND
            );
        }
    }
}