import { CreateFollowDto } from "../dto/create.follow.dto";
import { SnsBaseUser } from "./follow.user.interface";


export interface FollowRepositoryInterface {
    createFollowing(userId: string, createFollowDto: CreateFollowDto): Promise<void>;

    findFollowByUserId(userId: string): Promise<SnsBaseUser[]>;
    findFollowingByUserId(userId: string): Promise<SnsBaseUser[]>;

    isFollowing(userId: string, followId: string): Promise<boolean>

    
    deleteFollow(userId: string, followId: string): Promise<void>;


}