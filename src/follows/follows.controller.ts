import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
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

    @Get('follow')
    async getFollowByUserId(@Param('userId') userId: string): Promise<any> {
        return await this.followsService.getFollowByUserId(userId);
    }

    @Get('following')
    async getFollowingByUserId(@Param('userId') userId: string): Promise<any> {
        return await this.followsService.getFollowingByUserId(userId);
    }

    async deleteFollow(@Param('userId') userId: string, followId: string): Promise<void> {
        return await this.followsService.deleteFollow(userId, followId);
    }
}
