import { HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateCommentDto, CreateImageCommentDto, UpdateCommentDto } from "src/comments/dto/create.comment.dto";
import { ImageCommentCreateResponse, GetCommentsPaginationResponse, CommentCreateResponse } from "src/comments/interface/comment.interface";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { getS3ImageUrl } from "src/common/utils/s3";
import { Comment } from "src/entity/comment.entity";
import { Repository } from "typeorm";

export class CommentRepository {
    constructor(@InjectRepository(Comment) private readonly repository: Repository<Comment>,
        private readonly configService: ConfigService) {
    }

    async createComment(userId: string, postId: string, createCommentDto: CreateCommentDto): Promise<CommentCreateResponse> {    
        const { content } = createCommentDto
        const comment = this.repository.create({ user: { id: userId }, post: { id: postId }, content})

        const savedComment = await this.repository.save(comment)
        
        const ret = {
            id: savedComment.id,
            content: savedComment.content,
            createdAt: savedComment.createdAt,
            updatedAt: savedComment.updatedAt
        }
        return ret
    }

    async createImageComment(userId: string, postId: string, postImageId: string, createCommentDto: CreateImageCommentDto): Promise<ImageCommentCreateResponse> {    
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

        const rawResult = await this.repository.manager.query(`
            SELECT 
            comment.id, 
            comment.content, 
            comment.x, 
            comment.y, 
            comment.created_at createdAt, 
            comment.updated_at updatedAt, 
            user.id AS userId, 
            user.name, 
            (
                SELECT profileImage.url
                FROM image profileImage
                WHERE profileImage.user_id = user.id
                ORDER BY profileImage.created_at DESC
                LIMIT 1
            ) AS profileImage
            FROM 
                comment
                LEFT JOIN user ON comment.user_id = user.id
            ORDER BY 
                comment.created_at DESC
            LIMIT ?, ?;
        `, [skip, limit]);

        const comments = rawResult.map(row => {
            return {
                id: row.id,
                user: {
                    id: row.userId,
                    name: row.name,
                    profileImage: getS3ImageUrl(this.configService, row.profileImage),
                },
                content: row.content,
                x: row.x,
                y: row.y,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
            };
        });

        const rawCount = await this.repository.manager.query(`
            SELECT COUNT(*) as count FROM comment
        `);
        const count = Number(rawCount[0].count)

        const totalPages = Math.ceil(count / limit);
        return {
            data: comments.map(comment => ({
                id: comment.id,
                user: comment.user,
                content: comment.content,
                x: comment.x,
                y: comment.y,
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