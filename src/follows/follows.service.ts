import { Inject, Injectable } from '@nestjs/common';
import { FollowRepositoryInterface } from './interface/follow.repository.interface';
import { FollowServiceInterface } from './interface/follow.service.interface';
import { SnsBaseUser } from './interface/follow.user.interface';
import { CreateFollowDto } from './dto/create.follow.dto';

@Injectable()
export class FollowsService implements FollowServiceInterface {
    constructor(@Inject('FollowRepositoryInterface') private readonly followRepositoryInterface: FollowRepositoryInterface,) { }

    async createFollowing(userId: string, createFollowDto: CreateFollowDto): Promise<void> {
        const isFollowing = await this.followRepositoryInterface.isFollowing(userId, createFollowDto.followId)

        if (!isFollowing) {
            await this.followRepositoryInterface.createFollowing(userId, createFollowDto);
        }
    }

    async getFollowByUserId(userId: string): Promise<SnsBaseUser[]> {
        return await this.followRepositoryInterface.findFollowByUserId(userId);
    }

    async getFollowingByUserId(userId: string): Promise<SnsBaseUser[]> {
        return await this.followRepositoryInterface.findFollowingByUserId(userId);
    }

    async deleteFollow(userId: string, followId: string): Promise<void> {
        return await this.followRepositoryInterface.deleteFollow(userId, followId);
    }
}
