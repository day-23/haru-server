import { SnsBaseUser } from "src/follows/interface/follow.user.interface";


export interface PostImageCommentResponse{
    id: string,
    user : SnsBaseUser
    content : string
}

export interface ImageResponse {
    id: string,
    originalName: string,
    url: string,
    mimeType: string
}

export interface PostImageResponse {
    id: string,
    originalName: string,
    url: string,
    mimeType: string,
    comments : any[]
}