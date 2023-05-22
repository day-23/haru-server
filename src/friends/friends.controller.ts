import { Body, Controller, Delete, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { CreateFreindRequestDto, DeleteFollowDto, DeleteFollowingDto, acceptFreindRequestDto } from './dto/create.freind.dto';
import { ApiOperation } from '@nestjs/swagger';
import { FriendsService as FriendsService } from './friends.service';

@Controller('friends/:userId')
export class FriendsController {
    constructor( private readonly freindsService: FriendsService) { }

    @Post('request')
    @ApiOperation({ summary: '친구 추가 신청 API', description: '친구 추가 신청을 한다.' })
    async createFreindRequest(@Param('userId') userId: string, @Body() createFollowDto: CreateFreindRequestDto): Promise<void> {
        return await this.freindsService.createFriendRequest(userId, createFollowDto);
    }

    @Post('accept')
    @ApiOperation({ summary: '친구 추가 신청 API', description: '친구 추가 신청을 한다.' })
    async acceptFreindRequest(@Param('userId') userId: string, @Body() createFollowDto: acceptFreindRequestDto): Promise<void> {
        return await this.freindsService.acceptFriendRequest(userId, createFollowDto);
    }



    // @PaginatedResponse()
    // @Get(':specificUserId/following')
    // @ApiOperation({ summary: '유저의 팔로잉 목록 조회', description: '유저의 팔로잉 목록 조회' })
    // async getFollowingByUserId(@Param('userId') userId: string, @Param('specificUserId') specificUserId : string, @Query() paginationDto: PaginationDto): Promise<any> {
    //     return await this.freindsService.getFollowingByUserId(userId, specificUserId, paginationDto);
    // }

    // @PaginatedResponse()
    // @Get(':specificUserId/follow')
    // @ApiOperation({ summary: '유저의 팔로우 목록 조회', description: '유저의 팔로우 목록 조회' })
    // async getFollowByUserId(@Param('userId') userId: string, @Param('specificUserId') specificUserId : string, @Query() paginationDto: PaginationDto): Promise<any> {
    //     return await this.freindsService.getFollowByUserId(userId,specificUserId, paginationDto);
    // }    

    // @Delete('following')
    // @ApiOperation({ summary: '유저의 팔로잉 삭제', description: '유저의 팔로잉 삭제' })
    // async deleteFollowing(@Param('userId') userId: string, @Body() createFollowDto: DeleteFollowingDto): Promise<void> {
    //     return await this.freindsService.deleteFollowing(userId, createFollowDto);
    // }

    // @Delete('follow')
    // @ApiOperation({ summary: '유저의 팔로잉 삭제', description: '유저의 팔로잉 삭제' })
    // async deleteFollow(@Param('userId') userId: string, @Body() createFollowDto: DeleteFollowDto): Promise<void> {
    //     return await this.freindsService.deleteFollow(userId, createFollowDto);
    // }
}
