import { Inject, Injectable } from '@nestjs/common';
import { AwsService } from 'src/aws/aws.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PostRepository } from 'src/posts/post.repository';
import { CreatePostDto, UpdatePostDto } from './dto/create.post.dto';
import { PostImageResponse } from './interface/post-image.interface';
import { HashtagServiceInterface } from 'src/hashtags/interface/hashtag.service.interface';
import { BaseHashTag, PostCreateResponse } from './interface/post.interface';

@Injectable()
export class PostService {
    constructor(private readonly postRepository: PostRepository,
        private readonly awsService: AwsService,
        @Inject('HashtagServiceInterface') private readonly hashtagService: HashtagServiceInterface,
        ) { }

    async createPost(userId: string, files: Express.Multer.File[], createPostDto:CreatePostDto) : Promise<PostCreateResponse>{
        const images = await this.awsService.uploadFilesToS3('sns', files)

        const hashTags = await this.hashtagService.createHashtags({ contents: createPostDto.hashTags})
        const post =  await this.postRepository.createPost(userId, createPostDto, images)
        const postTags = await this.postRepository.createPostTags(userId, post.id, hashTags)

        return post
    }

    async getPostsByPagination(userId : string, paginationDto: PaginationDto){
        return await this.postRepository.getPostsByPagination(userId, paginationDto);
    }

    async getPostsFilterByHashTagIdAndPagination(userId : string, hashTagId : string, paginationDto: PaginationDto){
        return await this.postRepository.getPostsFilterByHashTagIdAndPagination(userId, hashTagId, paginationDto);
    }

    async getSpecificUserFeedByPagination(userId: string, specificUserId: string, paginationDto: PaginationDto) {
        return await this.postRepository.getSpecificUserFeedByPagination(userId, specificUserId, paginationDto);
    }

    async getSpecificUserMediaByPagination(userId: string, specificUserId: string, paginationDto: PaginationDto) {
        return await this.postRepository.getSpecificUserMediaByPagination(userId, specificUserId, paginationDto);
    }

    async getSpecificUserMediaFilterByHashTagAndPagination(userId: string, specificUserId: string, hashTagId: string, paginationDto: PaginationDto) {
        return await this.postRepository.getSpecificUserMediaFilterByHashTagAndPagination(userId, specificUserId, hashTagId, paginationDto);
    }

    async updatePost(userId: string, postId: string, updatePostDto: UpdatePostDto): Promise<void> {
        return await this.postRepository.updatePost(userId, postId, updatePostDto)
    }

    async deletePost(userId: string, postId: string) : Promise<void>{
        return await this.postRepository.deletePost(userId, postId)
    }

    async uploadProfileImage(userId: string, file: Express.Multer.File): Promise<PostImageResponse>{
        const image = await this.awsService.uploadFileToS3('profile', file)
        return await this.postRepository.createProfileImage(userId, image)
    }

    async getProfileImagesByUserId(userId: string): Promise<PostImageResponse[]> {
        return await this.postRepository.getProfileImagesByUserId(userId)
    }


    async getHashtags(): Promise<BaseHashTag[]> {
        return await this.postRepository.getHashtags()
    }

    async getHashtagsByUserId(userId: string): Promise<BaseHashTag[]> {
        return await this.postRepository.getHashtagsByUserId(userId)
    }

    async likePost(userId: string, postId: string) : Promise<void>{
        return await this.postRepository.likePost(userId, postId)
    }
}
