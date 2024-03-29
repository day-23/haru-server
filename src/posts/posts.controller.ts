import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Query, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginatedResponse } from 'src/common/decorators/paginated-response.decorator';
import { PaginationDto, PostPaginationDto } from 'src/common/dto/pagination.dto';
import { CreatePostDto, CreateTemplatePostDto, UpdatePostDto } from './dto/create.post.dto';
import { ImageResponse } from './interface/post-image.interface';
import { BaseHashTag, PostUserResponse } from './interface/post.interface';
import { PostService } from './posts.service';
import { imageFileFilter } from './image-file-filter';
import { UserInfoResponse } from './interface/user-info.interface';
import { UpdateInitialProfileDto, UpdateInitialProfileHaruIdDto, UpdateInitialProfileNameDto, UpdateProfileDto } from 'src/users/dto/profile.dto';
import { InitialUpdateProfileResponse } from 'src/users/interface/user.interface';

@Controller('post/:userId')
@ApiTags('게시물 API')
export class PostsController {
    constructor(private readonly postService: PostService) { }

    @Post()
    @ApiOperation({ summary: '게시물 생성 API (이미지 업로드 포함)', description: '게시물을 생성한다.' })
    @UseInterceptors(FilesInterceptor('images', 10,
        {
            limits: {
                fileSize: 40 * 1024 * 1024, // 40MB
                files: 10, // 파일 10개로 제한
            },
            // Validate the file types
            fileFilter: imageFileFilter,
        }))
    async uploadFilesToS3(@Param('userId') userId: string, @UploadedFiles() files: Express.Multer.File[], @Body() createPostDto:CreatePostDto) {
        return await this.postService.createPost(userId, files, createPostDto)
    }

    @Post('template')
    @ApiOperation({ summary: '템플릿으로 게시물 생성 API', description: '게시물을 생성한다.' })
    async uploadTemplatePost(@Param('userId') userId: string, @Body() createPostDto: CreateTemplatePostDto) {
        return await this.postService.createTemplatePost(userId, createPostDto)
    }

    @Post('template/admin')
    @ApiOperation({ summary: '어드민용 템플릿 이미지 생성 API (이미지 업로드 포함)', description: '템플릿을 생성한다.' })
    @UseInterceptors(FilesInterceptor('templates', 10,
        {
            limits: {
                fileSize: 40 * 1024 * 1024, // 40MB
                files: 10, // 파일 10개로 제한
            },
            // Validate the file types
            fileFilter: imageFileFilter,
        }))
    async uploadTemplatesToS3(@Param('userId') userId: string, @UploadedFiles() files: Express.Multer.File[]) {
        return await this.postService.uploadTemplate(userId, files)
    }

    @Get('template')
    @ApiOperation({ summary: '템플릿 이미지 불러오기 API (이미지 업로드 포함)', description: '템플릿 이미지를 불러온다.' })
    async getTemplates(@Param('userId') userId: string) {
        return await this.postService.getTemplates(userId)
    }

    @Patch('profile')
    @ApiOperation({ summary: '사용자 프로필 설정', description: '프로필을 설정한다.' })
    async updateProfile(@Param('userId') userId: string, @Body() updateProfileDto: UpdateProfileDto): Promise<UserInfoResponse> {
        return await this.postService.updateProfile(userId, updateProfileDto)
    }

    /* 프로필 사진 추가(이미지 하나 추가) */
    @Patch('profile/image')
    @ApiOperation({ summary: '사용자 프로필 이미지 설정', description: '프로필 이미지를 추가한다.' })
    @UseInterceptors(FileInterceptor('image',
        {
            limits: {
                fileSize: 40 * 1024 * 1024, // 40MB
            },
            // Validate the file types
            fileFilter: imageFileFilter,
        }))
    async uploadProfileImage(@Param('userId') userId: string, @UploadedFile() file: Express.Multer.File, @Body() updateProfileDto: UpdateProfileDto): Promise<UserInfoResponse> {
        return await this.postService.uploadProfileWithImage(userId, file, updateProfileDto)
    }

    //after signup, input user informantion
    @Patch('/profile/init')
    @ApiOperation({ summary: '사용자 프로필 설정', description: '프로필을 설정한다.' })
    async updateProfileInit(@Param('userId') userId: string, @Body() updateProfileDto: UpdateInitialProfileDto): Promise<InitialUpdateProfileResponse> {
        return await this.postService.updateInitialProfile(userId, updateProfileDto)
    }

    @Patch('/profile/init/haruId')
    @ApiOperation({ summary: '사용자 프로필 설정', description: '프로필을 설정한다.' })
    async updateProfileInitHaruId(@Param('userId') userId: string, @Body() updateProfileDto: UpdateInitialProfileHaruIdDto){
        return await this.postService.updateInitialProfileHaruId(userId, updateProfileDto)
    }

    @Patch('/profile/init/name')
    @ApiOperation({ summary: '사용자 프로필 설정', description: '프로필을 설정한다.' })
    async updateProfileInitName(@Param('userId') userId: string, @Body() updateProfileDto: UpdateInitialProfileNameDto){
        return await this.postService.updateInitialProfileName(userId, updateProfileDto)
    }

    @PaginatedResponse()
    @Get('posts/all')
    @ApiOperation({ summary: '전체 게시물(둘러보기) 페이지네이션 조회 API', description: '둘러보기 게시물 조회' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 아이템 개수 (기본값: 10)' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호 (기본값: 1)' })
    async getPostsByPagination(@Param('userId') userId: string, @Query() postPaginationDto: PostPaginationDto) {
        return await this.postService.getPostsByPagination(userId, postPaginationDto);
    }

    @PaginatedResponse()
    @Get('posts/hashtag/:hashTagId')
    @ApiOperation({ summary: '전체 게시물(둘러보기) 태그 선택 조회 API', description: '둘러보기 게시물 조회' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 아이템 개수 (기본값: 10)' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호 (기본값: 1)' })
    async getPostsFilterByHashTagIdAndPagination(@Param('userId') userId: string, @Param('hashTagId') hashTagId: string, @Query() postPaginationDto: PostPaginationDto) {
        return await this.postService.getPostsFilterByHashTagIdAndPagination(userId, hashTagId, postPaginationDto);
    }

    @PaginatedResponse()
    @Get('posts/user/:specificUserId/feed')
    @ApiOperation({ summary: '특정 사용자 feed 게시물 페이지네이션 조회 API', description: '특정 사용자 feed 게시물 페이지네이션 조회 API' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 아이템 개수 (기본값: 10)' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호 (기본값: 1)' })
    async getSpecificUserFeedByPagination(@Param('userId') userId: string, @Param('specificUserId') specificUserId: string, @Query() postPaginationDto: PostPaginationDto) {
        return await this.postService.getSpecificUserFeedByPagination(userId, specificUserId, postPaginationDto);
    }

    @PaginatedResponse()
    @Get('posts/follow/feed')
    @ApiOperation({ summary: '유저의 팔로잉 게시물 페이지네이션 조회 API', description: '유저의 팔로잉 게시물 페이지네이션 조회 API' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 아이템 개수 (기본값: 10)' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호 (기본값: 1)' })
    async getFollowingFeedByPagination(@Param('userId') userId: string, @Query() paginationDto: PostPaginationDto) {
        return await this.postService.getFollowingFeedByPagination(userId, paginationDto);
    }

    @PaginatedResponse()
    @Get('posts/user/:specificUserId/media')
    @ApiOperation({ summary: '특정 사용자 media 게시물 페이지네이션 전체 조회 API', description: '특정 사용자 media 게시물 조회' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 아이템 개수 (기본값: 10)' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호 (기본값: 1)' })
    async getSpecificUserMediaByPagination(@Param('userId') userId: string, @Param('specificUserId') specificUserId: string, @Query() paginationDto: PostPaginationDto) {
        return await this.postService.getSpecificUserMediaByPagination(userId, specificUserId, paginationDto);
    }

    @PaginatedResponse()
    @Get('posts/user/:specificUserId/media/hashtag/:hashTagId')
    @ApiOperation({ summary: '특정 사용자 media 게시물 해시태그로 필터링 하여 페이지네이션 전체 조회 API', description: '특정 사용자 media 게시물 해시태그로 필터링 하여 조회' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 아이템 개수 (기본값: 10)' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호 (기본값: 1)' })
    async getSpecificUserMediaFilterByHashTagAndPagination(@Param('userId') userId: string, @Param('specificUserId') specificUserId: string, @Param('hashTagId') hashTagId: string, @Query() postPaginationDto: PostPaginationDto) {
        return await this.postService.getSpecificUserMediaFilterByHashTagAndPagination(userId, specificUserId, hashTagId, postPaginationDto);
    }

    @Get('profile/images')
    @ApiOperation({ summary: '사용자 프로필 이미지를 조회', description: '프로필 이미지를 조회한다.' })
    async getProfileImagesByUserId(@Param('userId') userId: string): Promise<ImageResponse[]> {
        return await this.postService.getProfileImagesByUserId(userId)
    }

    @Get('hashtags')
    @ApiOperation({ summary: '둘러보기에서 해시태그를 10개 조회', description: '해시태그를 조회한다.' })
    async getHashtags(): Promise<BaseHashTag[]> {
        return await this.postService.getHashtags()
    }

    @Get('hashtags/:userId')
    @ApiOperation({ summary: '사용자의 해시태그를 조회', description: '해시태그를 조회한다.' })
    async getHashtagsByUserId(@Param('userId') userId: string): Promise<BaseHashTag[]> {
        return await this.postService.getHashtagsByUserId(userId)
    }

    @Get('info/:specificUserId')
    @ApiOperation({ summary: '사용자 정보 API', description: '사용자 정보를 가져온다.' })
    async getUserInfo(@Param('userId') userId: string, @Param('specificUserId') specificUserId: string): Promise<UserInfoResponse> {
        return await this.postService.getUserInfo(userId, specificUserId)
    }

    @Get('search/user/:haruId')
    @ApiOperation({ summary: '사용자 정보 API', description: '사용자 정보를 가져온다.' })
    async getUserByHaruId(@Param('userId') userId: string, @Param('haruId') haruId: string): Promise<UserInfoResponse> {
        return await this.postService.getUserByHaruId(userId, haruId)
    }

    @Patch(':postId')
    @ApiOperation({ summary: '게시물 수정 API', description: '게시물을 수정한다.' })
    async updatePost(@Param('userId') userId: string, @Param('postId') postId: string, @Body() updatePostDto: UpdatePostDto): Promise<void> {
        return await this.postService.updatePost(userId, postId, updatePostDto)
    }

    @Delete(':postId')
    @ApiOperation({ summary: '게시물 삭제 API', description: '게시물을 삭제한다.' })
    async deletePost(@Param('userId') userId: string, @Param('postId') postId: string): Promise<void> {
        return await this.postService.deletePost(userId, postId)
    }

    @Post(':postId/like')
    @ApiOperation({ summary: '게시물 좋아요 API', description: '게시물을 좋아요한다.' })
    async likePost(@Param('userId') userId: string, @Param('postId') postId: string): Promise<void> {
        return await this.postService.likePost(userId, postId)
    }

    @Post(':postId/hide')
    @ApiOperation({ summary: '게시물 숨기기 API', description: '게시물을 숨긴다.' })
    async hidePost(@Param('userId') userId: string, @Param('postId') postId: string): Promise<void> {
        return await this.postService.hidePost(userId, postId)
    }

    @Post(':postId/report')
    @ApiOperation({ summary: '게시물 신고하기 API', description: '게시물을 신고한다.' })
    async reportPost(@Param('userId') userId: string, @Param('postId') postId: string): Promise<void> {
        return await this.postService.reportPost(userId, postId)
    }
}
