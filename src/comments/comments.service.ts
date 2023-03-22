import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CommentRepository } from 'src/repository/comment.repository';
import { CreateCommentDto, UpdateCommentDto } from './dto/create.comment.dto';
import { CommentCreateResponse, CommentGetResponse, GetCommentsPaginationResponse } from './interface/comment.interface';

@Injectable()
export class CommentsService {
    constructor(private readonly commentRepository: CommentRepository) { }

    /* 구현 예정 */
    async createComment(userId: string, postId : string,  createCommentDto: CreateCommentDto) : Promise<CommentCreateResponse>{
        return await this.commentRepository.createComment(userId, postId, createCommentDto)
    }

    async getCommentsByPagination(userId : string, paginationDto: PaginationDto): Promise<GetCommentsPaginationResponse>{
        return await this.commentRepository.getCommentsByPagination(userId, paginationDto);
    }

    async updateComment(userId: string, commentId: string, updateCommentDto: UpdateCommentDto): Promise<void>{
        return await this.commentRepository.updateComment(userId, commentId, updateCommentDto)
    }

    async deleteComment(userId: string, commentId: string) : Promise<void>{
        return await this.commentRepository.deleteComment(userId, commentId)
    }
}