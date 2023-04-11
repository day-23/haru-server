import { PaginationDto } from "src/common/dto/pagination.dto";
import { CreateFollowDto } from "../dto/create.follow.dto";
import { GetSnsBaseUserByPaginationDto, SnsBaseUser } from "./follow.user.interface";


export interface FollowRepositoryInterface {
    createFollowing(userId: string, createFollowDto: CreateFollowDto): Promise<void>;

    findFollowByUserId(userId: string, paginationDto: PaginationDto): Promise<GetSnsBaseUserByPaginationDto>;
    findFollowingByUserId(userId: string, paginationDto: PaginationDto): Promise<GetSnsBaseUserByPaginationDto>;

    isFollowing(userId: string, followId: string): Promise<boolean>

    
    deleteFollow(userId: string, createFollowDto: CreateFollowDto): Promise<void>;


}