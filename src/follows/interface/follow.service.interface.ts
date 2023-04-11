import { PaginationDto } from "src/common/dto/pagination.dto";
import { CreateFollowDto, DeleteFollowDto, DeleteFollowingDto } from "../dto/create.follow.dto";
import { GetSnsBaseUserByPaginationDto, SnsBaseUser } from "./follow.user.interface";

export interface FollowServiceInterface {
    createFollowing(userId: string, createFollowDto: CreateFollowDto): Promise<void>;

    getFollowByUserId(userId: string, paginationDto: PaginationDto): Promise<GetSnsBaseUserByPaginationDto>;
    getFollowingByUserId(userId: string, paginationDto: PaginationDto): Promise<GetSnsBaseUserByPaginationDto>;

    deleteFollowing(userId: string, deleteFollowingDto: DeleteFollowingDto): Promise<void>;
    deleteFollow(userId: string, deleteFollowDto: DeleteFollowDto): Promise<void>;
}