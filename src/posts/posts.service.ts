import { Inject, Injectable } from '@nestjs/common';
import { AwsService } from 'src/aws/aws.service';
import { ConfigService } from "@nestjs/config";
import { PaginationDto, PostPaginationDto } from 'src/common/dto/pagination.dto';
import { PostRepository } from 'src/posts/post.repository';
import { CreatePostDto, CreateTemplatePostDto, UpdatePostDto } from './dto/create.post.dto';
import { ImageResponse } from './interface/post-image.interface';
import { HashtagServiceInterface } from 'src/hashtags/interface/hashtag.service.interface';
import { BaseHashTag, GetPostsPaginationResponse, PostCreateResponse, PostUserResponse } from './interface/post.interface';
import { UserInfoResponse } from './interface/user-info.interface';
import { UpdateInitialProfileDto, UpdateProfileDto } from 'src/users/dto/profile.dto';
import { getImageUrl } from 'src/common/utils/s3';
import { UserService } from 'src/users/users.service';
import { InitialUpdateProfileResponse } from 'src/users/interface/user.interface';

@Injectable()
export class PostService {
    constructor(private readonly postRepository: PostRepository,
        private readonly awsService: AwsService,
        private readonly configService : ConfigService,
        private readonly userService : UserService,
        @Inject('HashtagServiceInterface') private readonly hashtagService: HashtagServiceInterface,
        ) { }

    async uploadTemplate(userId: string, files: Express.Multer.File[]){
        const images = await this.awsService.uploadFilesToS3('template', files)
        const post = await this.postRepository.createTemplate(userId, images)
        return post
    }

    async getTemplates(userId: string){
        return await this.postRepository.getTemplates(userId)
    }

    async createTemplatePost(userId: string, createPostDto: CreateTemplatePostDto) {
        const hashTags = await this.hashtagService.createHashtags({ contents: createPostDto.hashTags })
        const post = await this.postRepository.createTemplatePost(userId, createPostDto)
        const postTags = await this.postRepository.createPostTags(userId, post.id, hashTags)
        return post
    }

    async createPost(userId: string, files: Express.Multer.File[], createPostDto:CreatePostDto) : Promise<PostCreateResponse>{
        const images = await this.awsService.uploadFilesToS3('sns', files)

        const hashTags = await this.hashtagService.createHashtags({ contents: createPostDto.hashTags})
        const post =  await this.postRepository.createPost(userId, createPostDto, images)
        const postTags = await this.postRepository.createPostTags(userId, post.id, hashTags)

        return post
    }

    async getPostsByPagination(userId : string, postPaginationDto: PostPaginationDto){
        return await this.postRepository.getPostsByPagination(userId, postPaginationDto);
    }

    async getPostsFilterByHashTagIdAndPagination(userId : string, hashTagId : string, postPaginationDto: PostPaginationDto){
        return await this.postRepository.getPostsFilterByHashTagIdAndPagination(userId, hashTagId, postPaginationDto);
    }

    async getFollowingFeedByPagination(userId: string, paginationDto: PostPaginationDto) {
        return await this.postRepository.getFollowingFeedByPagination(userId, paginationDto);
    }

    async getSpecificUserFeedByPagination(userId: string, specificUserId: string, postPaginationDto: PostPaginationDto) {
        return await this.postRepository.getSpecificUserFeedByPagination(userId, specificUserId, postPaginationDto);
    }

    async getSpecificUserMediaByPagination(userId: string, specificUserId: string, postPaginationDto: PostPaginationDto): Promise<GetPostsPaginationResponse> {
        return await this.postRepository.getSpecificUserMediaByPagination(userId, specificUserId, postPaginationDto);
    }

    async getSpecificUserMediaFilterByHashTagAndPagination(userId: string, specificUserId: string, hashTagId: string, postPaginationDto: PostPaginationDto) {
        return await this.postRepository.getSpecificUserMediaFilterByHashTagAndPagination(userId, specificUserId, hashTagId, postPaginationDto);
    }

    async updatePost(userId: string, postId: string, updatePostDto: UpdatePostDto): Promise<void> {
        return await this.postRepository.updatePost(userId, postId, updatePostDto)
    }


    async deletePost(userId: string, postId: string) : Promise<void>{
        return await this.postRepository.deletePost(userId, postId)
    }

    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserInfoResponse> {
        await this.postRepository.updateProfile(userId, updateProfileDto)
        return await this.getUserInfo(userId, userId)
    }

    async uploadProfileWithImage(userId: string, file: Express.Multer.File, updateProfileDto: UpdateProfileDto): Promise<UserInfoResponse>{
        const image = await this.awsService.uploadFileToS3('profile', file)
        await this.postRepository.createProfileImage(userId, image)

        const profileImageUrl = getImageUrl(this.configService, image.uploadedFile.key)
        return await this.updateProfile(userId, {...updateProfileDto, profileImageUrl})
    }


    async getUserInfoWithOptions(userId : string){
        const profileInfo = await this.getUserInfo(userId, userId)
        const userInfo = await this.userService.findOne(userId)
        
        console.log('here')
        return {
            user: {
                id: profileInfo.id,
                name: profileInfo.name,
                introduction: profileInfo.introduction,
                profileImage: profileInfo.profileImage,
                postCount: profileInfo.postCount,
                friendCount: profileInfo.friendCount,
                friendStatus: profileInfo.friendStatus,
                isPublicAccount: profileInfo.isPublicAccount
            },
            haruId: userInfo.haruId,
            email: userInfo.email,
            socialAccountType: userInfo.socialAccountType,
            isPostBrowsingEnabled: userInfo.isPostBrowsingEnabled,
            isAllowFeedLike: userInfo.isAllowFeedLike,
            isAllowFeedComment: userInfo.isAllowFeedComment,
            isAllowSearch: userInfo.isAllowSearch,
            createdAt: userInfo.createdAt
        }
    }

    async updateInitialProfile(userId: string, updateInitialProfileDto: UpdateInitialProfileDto): Promise<InitialUpdateProfileResponse> {
        const { haruId, ...updateProfileDto } = updateInitialProfileDto

        await this.userService.updateHaruId(userId, haruId)
        await this.updateProfile(userId, updateProfileDto)

        return await this.getUserInfoWithOptions(userId)
    }

    async getProfileImagesByUserId(userId: string): Promise<ImageResponse[]> {
        return await this.postRepository.getProfileImagesByUserId(userId)
    }

    async getHashtags(): Promise<BaseHashTag[]> {
        return await this.postRepository.getHashtags()
    }

    async getHashtagsByUserId(userId: string): Promise<BaseHashTag[]> {
        return await this.postRepository.getHashtagsByUserId(userId)
    }

    async getUserInfo(userId: string, specificUserId : string) : Promise<UserInfoResponse>{
        return await this.postRepository.getUserInfo(userId, specificUserId)
    }

    async getUserByHaruId(userId: string, haruId: string) : Promise<UserInfoResponse>{
        return await this.postRepository.getUserByHaruId(userId, haruId)
    }

    async likePost(userId: string, postId: string) : Promise<void>{
        return await this.postRepository.likePost(userId, postId)
    }

    async reportPost(userId: string, postId: string) : Promise<void>{
        return await this.postRepository.reportPost(userId, postId)
    }
}
