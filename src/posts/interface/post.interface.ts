import { Pagination } from "src/common/interface/pagination.interface";
import { User } from "src/entity/user.entity";
import { PostImageResponse } from "./post-image.interface";

export interface PostCreateResponse {
    id: string,
    content: string,
    images : PostImageResponse[],
    hashTags: string[],
    createdAt: string | Date,
    updatedAt: string | Date,
}

export interface PostUserResponse {
    id : string,
    name : string,
    profileImage : string,
}

export interface PostGetResponse extends PostCreateResponse{
    user : PostUserResponse,
}


export interface GetPostsPaginationResponse {
    data: PostGetResponse[],
    pagination: Pagination
}


export interface BaseHashTag{
    id: string,
    content: string
}