import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginatedResponse } from 'src/common/decorators/paginated-response.decorator';
import { PaginationDto, PostPaginationDto } from 'src/common/dto/pagination.dto';
import { CommentsService } from './comments.service';
import { CreateCommentDto, CreateImageCommentDto, UpdateCommentDto, UpdateCommentsByWriterDto } from './dto/create.comment.dto';
import { ImageCommentCreateResponse, CommentGetResponse, GetCommentsPaginationResponse, CommentCreateResponse } from './interface/comment.interface';

@Controller('comment/:userId')
@ApiTags('댓글 API')
export class CommentsController {
    constructor(private readonly commentService: CommentsService) { }

    @Post(':postId')
    @ApiOperation({ summary: '이미지에 댓글 작성 API', description: '댓글을 생성한다.' })
    async createCommentInTemplate(@Param('userId') userId: string, @Param('postId') postId: string, @Body() createCommentDto: CreateImageCommentDto): Promise<ImageCommentCreateResponse> {
        return await this.commentService.createImageComment(userId, postId, null, createCommentDto)
    }

    @Post(':postId/:postImageId')
    @ApiOperation({ summary: '이미지에 댓글 작성 API', description: '댓글을 생성한다.' })
    async createCommentInImage(@Param('userId') userId: string, @Param('postId') postId: string, @Param('postImageId') postImageId:string, @Body() createCommentDto: CreateImageCommentDto): Promise<ImageCommentCreateResponse> {
        return await this.commentService.createImageComment(userId, postId, postImageId, createCommentDto)
    }

    @PaginatedResponse()
    @Get(':postId/comments/all')
    @ApiOperation({ summary: '전체 댓글(둘러보기) 페이지네이션 조회 API', description: '둘러보기 댓글 조회' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 아이템 개수 (기본값: 10)' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호 (기본값: 1)' })
    async getCommentsByPagination(@Param('userId') userId: string, @Param('postId') postId: string, @Query() paginationDto: PostPaginationDto): Promise<GetCommentsPaginationResponse> {
        return await this.commentService.getCommentsByPagination(userId, postId, paginationDto);
    }

    
    @Get(':postId/:postImageId/comments/recent')
    @ApiOperation({ summary: '전체 댓글(둘러보기) 페이지네이션 조회 API', description: '둘러보기 댓글 조회' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    async getRecentCommentsByPagination(@Param('userId') userId: string, @Param('postId') postId: string, @Param('postImageId') postImageId: string) {
        return await this.commentService.getRecentCommentsByPagination(userId, postId, postImageId);
    }

    @PaginatedResponse()
    @Get(':postId/:postImageId/comments/all')
    @ApiOperation({ summary: '전체 댓글(둘러보기) 페이지네이션 조회 API', description: '둘러보기 댓글 조회' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 아이템 개수 (기본값: 10)' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호 (기본값: 1)' })
    async getCommentsPerImageByPagination(@Param('userId') userId: string, @Param('postId') postId: string, @Param('postImageId') postImageId: string, @Query() paginationDto: PostPaginationDto): Promise<GetCommentsPaginationResponse> {
        return await this.commentService.getCommentsPerImageByPagination(userId, postId, postImageId, paginationDto);
    }

    @Patch(':commentId')
    @ApiOperation({ summary: '댓글 수정 API', description: '댓글을 수정한다.' })
    async updateComment(@Param('userId') userId: string, @Param('commentId') commentId: string, @Body() updateCommentDto: UpdateCommentDto): Promise<void> {
        return await this.commentService.updateComment(userId, commentId, updateCommentDto)
    }


    @Patch(':postId/comments/')
    @ApiOperation({ summary: '댓글 수정 API', description: '댓글을 수정한다.' })
    async updateComments(@Param('userId') userId: string, @Param('commentId') commentId: string, @Body() updateCommentDto: UpdateCommentsByWriterDto): Promise<void> {
        return await this.commentService.updateCommentsByWriter(userId, commentId, updateCommentDto)
    }


    @Delete(':commentId')
    @ApiOperation({ summary: '댓글 삭제 API', description: '댓글을 삭제한다.' })
    async deleteComment(@Param('userId') userId: string, @Param('commentId') commentId: string): Promise<void> {
        return await this.commentService.deleteComment(userId, commentId)
    }
}
