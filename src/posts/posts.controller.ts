import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AwsService } from 'src/aws/aws.service';
import { PaginatedResponse } from 'src/common/decorators/paginated-response.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreatePostDto, UpdatePostDto } from './dto/create.post.dto';
import { PostCreateResponse } from './interface/post.interface';
import { PostService } from './posts.service';

@Controller('post/:userId')
@ApiTags('게시물 API - 전체 작업중')
export class PostsController {
    constructor(private readonly postService: PostService,
        private readonly awsService : AwsService) { }

    @Post()
    @ApiOperation({ summary: '게시물 생성 API (이미지 업로드 포함)', description: '게시물을 생성한다.' })
    @UseInterceptors(FilesInterceptor('images', 10,
        {
            limits: {
                fileSize: 40 * 1024 * 1024, // 40MB
                files: 10, // 파일 10개로 제한
            },
            // Validate the file types
            fileFilter: (req: any, file: any, callback: (error: Error | null, acceptFile: boolean) => void) => {
                if (
                    file.mimetype === 'image/jpeg' ||
                    file.mimetype === 'image/png' ||
                    file.mimetype === 'image/gif'
                ) {
                    callback(null, true);
                } else {
                    const error = new HttpException(`Failed to upload file. file mimetype must be jpeg, png, gif`, HttpStatus.BAD_REQUEST);
                    callback(error, false);
                }
            },
        }))
    async uploadFilesToS3(@Param('userId') userId: string, @UploadedFiles() files: Express.Multer.File[], @Body() createPostDto:CreatePostDto) {
        return await this.postService.createPost(userId, files, createPostDto)
    }

    @PaginatedResponse()
    @Get('posts/all')
    @ApiOperation({ summary: '전체 게시물(둘러보기) 페이지네이션 조회 API', description: '둘러보기 게시물 조회' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 아이템 개수 (기본값: 10)' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호 (기본값: 1)' })
    async getPostsByPagination(@Param('userId') userId : string, @Query() paginationDto: PaginationDto){
        return await this.postService.getPostsByPagination(userId, paginationDto);
    }

    @Patch(':postId')
    @ApiOperation({ summary: '게시물 수정 API', description: '게시물을 수정한다.' })
    async updatePost(@Param('userId') userId: string, @Param('postId') postId: string, @Body() updatePostDto: UpdatePostDto): Promise<void> {
        return await this.postService.updatePost(userId, postId, updatePostDto)
    }

    @Delete(':postId')
    @ApiOperation({ summary: '게시물 삭제 API', description: '게시물을 삭제한다.' })
    async deletePost(@Param('userId') userId: string, @Param('postId') postId: string) : Promise<void>{
        return await this.postService.deletePost(userId , postId)
    }
    

}
