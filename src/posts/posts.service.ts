import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PostRepository } from 'src/repository/post.repository';
import { CreatePostDto, UpdatePostDto } from './dto/create.post.dto';
import { PostCreateResponse } from './interface/post.interface';

@Injectable()
export class PostService {
    constructor(private readonly postRepository: PostRepository) { }

    async createPost(userId: string, createPostDto: CreatePostDto) : Promise<PostCreateResponse>{
        return await this.postRepository.createPost(userId, createPostDto)
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
}
