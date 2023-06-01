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
    isAllowFeedLike : number,
    isAllowFeedComment : number,
    friendStatus : number
}

export interface SearchUserResponse{
    id : string,
    name : string,
    introduction : string,
    profileImage : string,
    isFriend : boolean
}

export interface PostGetResponse{
    id: string,
    user : PostUserResponse,
    content: string,
    isTemplatePost: string,
    images : PostImageResponse[],
    hashTags: string[],
    isLiked : boolean,
    isCommented : boolean,
    likedCount : number,
    commentCount : number,
    createdAt: Date,
    updatedAt: Date,
}

export interface GetPostsPaginationResponse {
    data: PostGetResponse[],
    pagination: Pagination
}


export interface BaseHashTag{
    id: string,
    content: string
}

export interface SnsBaseUser{
    id : string,
    name : string,
    email : string,
    profileImage : string
}


export interface SnsPostUser{
    id : string,
    name : string,
    email : string,
    profileImage : string
    isAllowFeedLike : number,
    isAllowFeedComment : number,
}



export interface FriendStatusDictionary {
    [userId: string]: number;
}
  