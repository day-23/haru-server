import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { FollowServiceInterface } from './interface/follow.service.interface';
import { CreateFollowDto } from './dto/create.follow.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('follows/:userId')
export class FollowsController {
    constructor(@Inject('FollowServiceInterface') private readonly followsService: FollowServiceInterface) {}

    @Post('follow')
    @ApiOperation({ summary: '팔로잉 추가 API', description: '팔로잉을 추가한다.' })
    async createFollow(@Param('userId') userId: string, @Body() createFollowDto: CreateFollowDto): Promise<void> {
        return await this.followsService.createFollowing(userId, createFollowDto);
    }

    async getFollowByUserId(userId: string): Promise<any> {
        return await this.followsService.getFollowByUserId(userId);
    }

    async getFollowingByUserId(userId: string): Promise<any> {
        return await this.followsService.getFollowingByUserId(userId);
    }

    async deleteFollow(userId: string, followId: string): Promise<void> {
        return await this.followsService.deleteFollow(userId, followId);
    }
}
