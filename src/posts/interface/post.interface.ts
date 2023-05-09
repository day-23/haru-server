import { Pagination } from "src/common/interface/pagination.interface";
import { User } from "src/entity/user.entity";
import { ImageResponse, PostImageResponse } from "./post-image.interface";

export interface PostCreateResponse {
    id: string,
    content: string,
    templateUrl: string,
    images : PostImageResponse[],
    hashTags: string[],
    createdAt: Date,
    updatedAt: Date,
}

export interface PostUserResponse {
    id : string,
    name : string,
    profileImage : string,
}

export interface PostGetResponse extends PostCreateResponse{
    user : PostUserResponse,
    isLiked : boolean,
    isCommented : boolean,
    likedCount : number,
    commentCount : number,
}

export interface GetPostsPaginationResponse {
    data: PostGetResponse[],
    pagination: Pagination
}


export interface BaseHashTag{
    id: string,
    content: string
}