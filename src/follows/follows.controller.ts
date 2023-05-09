import { Body, Controller, Delete, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { FollowServiceInterface } from './interface/follow.service.interface';
import { CreateFollowDto, DeleteFollowDto, DeleteFollowingDto } from './dto/create.follow.dto';
import { ApiOperation } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResponse } from 'src/common/decorators/paginated-response.decorator';

@Controller('follows/:userId')
export class FollowsController {
    constructor(@Inject('FollowServiceInterface') private readonly followsService: FollowServiceInterface) { }

    @Post('follow')
    @ApiOperation({ summary: '팔로잉 추가 API', description: '팔로잉을 추가한다.' })
    async createFollow(@Param('userId') userId: string, @Body() createFollowDto: CreateFollowDto): Promise<void> {
        return await this.followsService.createFollowing(userId, createFollowDto);
    }

    @PaginatedResponse()
    @Get(':specificUserId/following')
    @ApiOperation({ summary: '유저의 팔로잉 목록 조회', description: '유저의 팔로잉 목록 조회' })
    async getFollowingByUserId(@Param('userId') userId: string, @Param('specificUserId') specificUserId : string, @Query() paginationDto: PaginationDto): Promise<any> {
        return await this.followsService.getFollowingByUserId(userId, specificUserId, paginationDto);
    }

    @PaginatedResponse()
    @Get(':specificUserId/follow')
    @ApiOperation({ summary: '유저의 팔로우 목록 조회', description: '유저의 팔로우 목록 조회' })
    async getFollowByUserId(@Param('userId') userId: string, @Param('specificUserId') specificUserId : string, @Query() paginationDto: PaginationDto): Promise<any> {
        return await this.followsService.getFollowByUserId(userId,specificUserId, paginationDto);
    }    

    @Delete('following')
    @ApiOperation({ summary: '유저의 팔로잉 삭제', description: '유저의 팔로잉 삭제' })
    async deleteFollowing(@Param('userId') userId: string, @Body() createFollowDto: DeleteFollowingDto): Promise<void> {
        return await this.followsService.deleteFollowing(userId, createFollowDto);
    }

    @Delete('follow')
    @ApiOperation({ summary: '유저의 팔로잉 삭제', description: '유저의 팔로잉 삭제' })
    async deleteFollow(@Param('userId') userId: string, @Body() createFollowDto: DeleteFollowDto): Promise<void> {
        return await this.followsService.deleteFollow(userId, createFollowDto);
    }
}
