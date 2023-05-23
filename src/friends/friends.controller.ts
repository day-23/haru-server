import { Body, Controller, Delete, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { CreateFreindRequestDto, DeleteFriendDto, acceptFreindRequestDto } from './dto/create.freind.dto';
import { ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FriendsService as FriendsService } from './friends.service';
import { PaginationDto, PostPaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResponse } from 'src/common/decorators/paginated-response.decorator';

@Controller('friends/:userId')
export class FriendsController {
    constructor( private readonly freindsService: FriendsService) { }

    @Post('request')
    @ApiOperation({ summary: '친구 추가 신청 API', description: '친구 추가 신청 한다.' })
    async createFreindRequest(@Param('userId') userId: string, @Body() createFollowDto: CreateFreindRequestDto): Promise<void> {
        return await this.freindsService.createFriendRequest(userId, createFollowDto);
    }

    @Delete('request')
    @ApiOperation({ summary: '친구 신청 취소하기 API', description: '친구 신청 취소하기' })
    async deleteFreindRequest(@Param('userId') userId: string, @Body() createFollowDto: CreateFreindRequestDto): Promise<void> {
        return await this.freindsService.deleteFriendRequest(userId, createFollowDto);
    }

    @Post('accept')
    @ApiOperation({ summary: '친구 추가 수락 API', description: '친구 추가 수락.' })
    async acceptFreindRequest(@Param('userId') userId: string, @Body() createFollowDto: acceptFreindRequestDto): Promise<void> {
        return await this.freindsService.acceptFriendRequest(userId, createFollowDto);
    }


    @Delete()
    @ApiOperation({ summary: '친구 삭제 API', description: '친구를 삭제한다.' })
    async deleteFreind(@Param('userId') userId: string, @Body() createFollowDto: DeleteFriendDto): Promise<void> {
        return await this.freindsService.deleteFriend(userId, createFollowDto);
    }

    @PaginatedResponse()
    @Get('request')
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    async getFriendRequestList(@Param('userId') userId: string, @Query() paginationDto: PostPaginationDto): Promise<any> {
        return await this.freindsService.getFriendRequestList(userId, paginationDto);
    }

    @PaginatedResponse()
    @Get(':specificUserId')
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    async getFriendList(@Param('userId') userId: string, @Param('specificUserId') specificUserId : string, @Query() paginationDto: PostPaginationDto): Promise<any> {
        return await this.freindsService.getFreindList(userId, specificUserId, paginationDto);
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
