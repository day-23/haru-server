import { Controller } from '@nestjs/common';

@Controller('comments')
export class CommentsController {

    // @Post()
    // @ApiOperation({ summary: '게시물 생성 API', description: '게시물을 생성한다.' })
    // async createPost(@Param('userId') userId: string, @Body() createPostDto: CreatePostDto) : Promise<PostResponse>{
    //     return await this.postService.createPost(userId, createPostDto)
    // }

    // @PaginatedResponse()
    // @Get('posts/all')
    // @ApiOperation({ summary: '전체 게시물(둘러보기) 페이지네이션 조회 API', description: '둘러보기 게시물 조회' })
    // @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    // @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 아이템 개수 (기본값: 10)' })
    // @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호 (기본값: 1)' })
    // async getPostsByPagination(@Param('userId') userId : string, @Query() paginationDto: PaginationDto){
    //     return await this.postService.getPostsByPagination(userId, paginationDto);
    // }

    // @Patch(':postId')
    // @ApiOperation({ summary: '게시물 수정 API', description: '게시물을 수정한다.' })
    // async updatePost(@Param('userId') userId: string, @Body() updatePostDto: UpdatePostDto) : Promise<PostResponse>{
    //     return await this.postService.updatePost(userId, updatePostDto)
    // }

    // @Delete(':postId')
    // @ApiOperation({ summary: '게시물 삭제 API', description: '게시물을 삭제한다.' })
    // async deletePost(@Param('userId') userId: string) : Promise<void>{
    //     return await this.postService.deletePost(userId)
    // }
    


}
