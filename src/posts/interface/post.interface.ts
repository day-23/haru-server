import { Pagination } from "src/common/interface/pagination.interface";
import { User } from "src/entity/user.entity";

export interface PostCreateResponse {
    content: string,
    createdAt: string | Date,
    updatedAt: string | Date,
}

export interface PostGetResponse extends PostCreateResponse{
    id: string,
    user : User,
}


export interface GetPostsPaginationResponse {
    data: PostGetResponse[],
    pagination: Pagination
}
