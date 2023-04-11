import { Inject, Injectable } from '@nestjs/common';
import { FollowRepositoryInterface } from './interface/follow.repository.interface';
import { FollowServiceInterface } from './interface/follow.service.interface';
import { GetSnsBaseUserByPaginationDto, SnsBaseUser } from './interface/follow.user.interface';
import { CreateFollowDto, DeleteFollowDto, DeleteFollowingDto } from './dto/create.follow.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class FollowsService implements FollowServiceInterface {
    constructor(@Inject('FollowRepositoryInterface') private readonly followRepositoryInterface: FollowRepositoryInterface,) { }

    async createFollowing(userId: string, createFollowDto: CreateFollowDto): Promise<void> {
        const isFollowing = await this.followRepositoryInterface.isFollowing(userId, createFollowDto.followId)

        if (!isFollowing) {
            await this.followRepositoryInterface.createFollowing(userId, createFollowDto);
        }
    }

    async getFollowByUserId(userId: string, paginationDto: PaginationDto): Promise<GetSnsBaseUserByPaginationDto> {
        return await this.followRepositoryInterface.findFollowByUserId(userId, paginationDto);
    }

    async getFollowingByUserId(userId: string, paginationDto: PaginationDto): Promise<GetSnsBaseUserByPaginationDto> {
        return await this.followRepositoryInterface.findFollowingByUserId(userId, paginationDto);
    }

    async deleteFollowing(userId: string, deleteFollowingDto: DeleteFollowingDto): Promise<void> {
        return await this.followRepositoryInterface.deleteFollowing(userId, deleteFollowingDto);
    }

    async deleteFollow(userId: string, deleteFollowDto: DeleteFollowDto): Promise<void> {
        return await this.followRepositoryInterface.deleteFollow(userId, deleteFollowDto);
    }
}
