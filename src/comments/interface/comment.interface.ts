import { Pagination } from "src/common/interface/pagination.interface";
import { User } from "src/entity/user.entity";

export interface CommentCreateResponse {
    content: string,
    x : number,
    y : number,
    createdAt: string | Date,
    updatedAt: string | Date,
}

export interface CommentGetResponse extends CommentCreateResponse{
    id: string,
    user : User,
}


export interface GetCommentsPaginationResponse {
    data: CommentGetResponse[],
    pagination: Pagination
}
