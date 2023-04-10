import { PaginationDto } from "src/common/dto/pagination.dto";
import { CreateFollowDto } from "../dto/create.follow.dto";
import { GetSnsBaseUserByPaginationDto, SnsBaseUser } from "./follow.user.interface";

export interface FollowServiceInterface {
    createFollowing(userId: string, createFollowDto: CreateFollowDto): Promise<void>;

    getFollowByUserId(userId: string, paginationDto: PaginationDto): Promise<GetSnsBaseUserByPaginationDto>;
    getFollowingByUserId(userId: string, paginationDto: PaginationDto): Promise<GetSnsBaseUserByPaginationDto>;

    deleteFollow(userId: string, createFollowDto: CreateFollowDto): Promise<void>;
}