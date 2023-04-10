import { Injectable } from '@nestjs/common';
import { AwsService } from 'src/aws/aws.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PostRepository } from 'src/posts/post.repository';
import { CreatePostDto, UpdatePostDto } from './dto/create.post.dto';
import { PostImageResponse } from './interface/post-image.interface';

@Injectable()
export class PostService {
    constructor(private readonly postRepository: PostRepository,
        private readonly awsService: AwsService
        ) { }

    async createPost(userId: string, files: Express.Multer.File[], createPostDto:CreatePostDto){
        const images = await this.awsService.uploadFilesToS3('sns', files)
        return await this.postRepository.createPost(userId, createPostDto, images)
    }

    async getPostsByPagination(userId : string, paginationDto: PaginationDto){
        return await this.postRepository.getPostsByPagination(userId, paginationDto);
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
}
