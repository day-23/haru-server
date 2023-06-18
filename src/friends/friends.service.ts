import { HttpException, HttpStatus, Inject, Injectable, Param, Query } from '@nestjs/common';
import { GetSnsBaseFriendsByPaginationDto } from './interface/friends.user.interface';
import { BlockUserDto, CreateFreindRequestDto, DeleteFriendDto, acceptFreindRequestDto } from './dto/create.freind.dto';
import { PaginationDto, PostPaginationDto, SearchPaginationDto } from 'src/common/dto/pagination.dto';
import { FriendRepository } from './friends.repository';
import { UserService } from 'src/users/users.service';
import { FriendStatus } from 'src/common/utils/constants';

@Injectable()
export class FriendsService {
    constructor(private readonly friendRepository: FriendRepository,
        private readonly userService : UserService) { }

    async createFriendRequest(userId: string, createFollowDto: CreateFreindRequestDto): Promise<void> {
        const { acceptorId } = createFollowDto

        //find user by userId and if not exist throw 404 error
        await this.userService.findOne(acceptorId)
        const isAlreadyMakeRequest = await this.friendRepository.findRequest(userId, acceptorId)

        if (!isAlreadyMakeRequest) {
            await this.friendRepository.createFreindRequest(userId, createFollowDto);
        }
    }

    async deleteFriendRequest(userId: string, createFollowDto: CreateFreindRequestDto): Promise<void> {
        const { acceptorId } = createFollowDto
        //find user by userId and if not exist throw 404 error
        await this.userService.findOne(acceptorId)

        const isAlreadyMakeRequest = await this.friendRepository.findRequest(userId, acceptorId)

        if (isAlreadyMakeRequest && isAlreadyMakeRequest.status === FriendStatus.FriendRequestSent) {
            await this.friendRepository.delete(isAlreadyMakeRequest.id);
        }
    }

    async acceptFriendRequest(userId: string, createFollowDto: acceptFreindRequestDto): Promise<void> {
        const { requesterId } = createFollowDto
        await this.friendRepository.deleteFriend(userId, requesterId)
        await this.friendRepository.createFriend(requesterId, userId)
        return
    }

    async blockUser(userId: string, blockUserDto : BlockUserDto){
        const { blockUserId } = blockUserDto
        await this.friendRepository.deleteFriend(userId, blockUserId)
        await this.friendRepository.createBlockUser(userId, blockUserId)
    }

    async deleteFriend(userId: string, createFollowDto: DeleteFriendDto){
        const { friendId } = createFollowDto
        await this.friendRepository.deleteFriend(userId, friendId)
    }

    async getFreindList(userId: string, specificUserId: string, paginationDto: PostPaginationDto): Promise<GetSnsBaseFriendsByPaginationDto> {
        return await this.friendRepository.getFriendList(userId, specificUserId, paginationDto);
    }

    async getFriendRequestList(userId: string, paginationDto: PostPaginationDto): Promise<GetSnsBaseFriendsByPaginationDto> {
        return await this.friendRepository.getFriendRequestList(userId, paginationDto);
    }

    async getFriendBySearch(userId: string, paginationDto: SearchPaginationDto): Promise<GetSnsBaseFriendsByPaginationDto> {
        return await this.friendRepository.getFriendBySearch(userId, paginationDto);
    }

    async getFriendRequestBySearch(userId: string, paginationDto: SearchPaginationDto): Promise<GetSnsBaseFriendsByPaginationDto> {
        return await this.friendRepository.getFriendRequestBySearch(userId, paginationDto);
    }
}
