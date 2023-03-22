import { InjectRepository } from "@nestjs/typeorm";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Post } from "src/entity/post.entity";
import { CreatePostDto } from "src/posts/dto/create.post.dto";
import { PostCreateResponse } from "src/posts/interface/post.interface";
import { Repository } from "typeorm";

export class CommentRepository {
    constructor(@InjectRepository(Post) private readonly repository: Repository<Post>) { }


    // async createPost(userId: string, createPostDto: CreatePostDto) : Promise<PostResponse>{
        
    // }

    // async getPostsByPagination(userId : string, paginationDto: PaginationDto){
        
    // }

    // async updatePost(userId: string,updatePostDto: UpdatePostDto) : Promise<PostResponse>{
        
    // }

    // async deletePost(userId: string) : Promise<void>{
        
    // }

}