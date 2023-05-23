import { Injectable } from '@nestjs/common';
import { PaginationDto, PostPaginationDto } from 'src/common/dto/pagination.dto';
import { CommentRepository } from 'src/comments/comment.repository';
import { CreateCommentDto, CreateImageCommentDto, UpdateCommentDto } from './dto/create.comment.dto';
import { ImageCommentCreateResponse, CommentGetResponse, GetCommentsPaginationResponse, CommentCreateResponse } from './interface/comment.interface';

@Injectable()
export class CommentsService {
    constructor(private readonly commentRepository: CommentRepository) { }

    async createComment(userId: string, postId: string, createCommentDto: CreateCommentDto): Promise<CommentCreateResponse> {
        return await this.commentRepository.createComment(userId, postId, createCommentDto)
    }

    async createImageComment(userId: string, postId: string, postImageId: string, createCommentDto: CreateImageCommentDto): Promise<ImageCommentCreateResponse> {
        return await this.commentRepository.createImageComment(userId, postId, postImageId, createCommentDto)
    }

    async getCommentsByPagination(userId: string, postId: string, paginationDto: PostPaginationDto): Promise<GetCommentsPaginationResponse> {
        return await this.commentRepository.getCommentsByPagination(userId, postId, paginationDto);
    }

    async getCommentsPerImageByPagination(userId: string, postId: string, postImageId : string, paginationDto: PostPaginationDto): Promise<GetCommentsPaginationResponse> {
        return await this.commentRepository.getCommentsPerImageByPagination(userId, postId, postImageId, paginationDto);
    }

    async updateComment(userId: string, commentId: string, updateCommentDto: UpdateCommentDto): Promise<void>{
        return await this.commentRepository.updateComment(userId, commentId, updateCommentDto)
    }

    async deleteComment(userId: string, commentId: string) : Promise<void>{
        return await this.commentRepository.deleteComment(userId, commentId)
    }
}
