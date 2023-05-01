import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginatedResponse } from 'src/common/decorators/paginated-response.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CommentsService } from './comments.service';
import { CreateCommentDto, CreateImageCommentDto, UpdateCommentDto } from './dto/create.comment.dto';
import { ImageCommentCreateResponse, CommentGetResponse, GetCommentsPaginationResponse, CommentCreateResponse } from './interface/comment.interface';

@Controller('comment/:userId')
@ApiTags('댓글 API')
export class CommentsController {
    constructor(private readonly commentService: CommentsService) { }

    @Post(':postId')
    @ApiOperation({ summary: '게시글에 댓글 작성 API', description: '댓글을 생성한다.' })
    async createComment(@Param('userId') userId: string, @Param('postId') postId: string, @Body() createCommentDto: CreateCommentDto): Promise<CommentCreateResponse> {
        return await this.commentService.createComment(userId, postId, createCommentDto)
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
    async getCommentsByPagination(@Param('userId') userId: string, @Query() paginationDto: PaginationDto): Promise<GetCommentsPaginationResponse> {
        return await this.commentService.getCommentsByPagination(userId, paginationDto);
    }

    @Patch(':commentId')
    @ApiOperation({ summary: '댓글 수정 API', description: '댓글을 수정한다.' })
    async updateComment(@Param('userId') userId: string, @Param('commentId') commentId: string, @Body() updateCommentDto: UpdateCommentDto): Promise<void> {
        return await this.commentService.updateComment(userId, commentId, updateCommentDto)
    }

    @Delete(':commentId')
    @ApiOperation({ summary: '댓글 삭제 API', description: '댓글을 삭제한다.' })
    async deleteComment(@Param('userId') userId: string, @Param('commentId') commentId: string): Promise<void> {
        return await this.commentService.deleteComment(userId, commentId)
    }
}
