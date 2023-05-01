import { Pagination } from "src/common/interface/pagination.interface";
import { User } from "src/entity/user.entity";

export interface CommentCreateResponse {
    content: string,
    createdAt: Date,
    updatedAt: Date,
}

export interface ImageCommentCreateResponse {
    content: string,
    x : number,
    y : number,
    createdAt: Date,
    updatedAt: Date,
}

export interface CommentGetResponse extends ImageCommentCreateResponse{
    id: string,
    user : User,
}


export interface GetCommentsPaginationResponse {
    data: CommentGetResponse[],
    pagination: Pagination
}
