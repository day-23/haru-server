import { CreateFollowDto } from "../dto/create.follow.dto";
import { SnsBaseUser } from "./follow.user.interface";

export interface FollowServiceInterface {
    createFollowing(userId: string, createFollowDto: CreateFollowDto): Promise<void>;

    getFollowByUserId(userId: string): Promise<SnsBaseUser[]>;
    getFollowingByUserId(userId: string): Promise<SnsBaseUser[]>;

    deleteFollow(userId: string, followId: string): Promise<void>;
}