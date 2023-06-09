import { HttpException, HttpStatus, Inject, Injectable, Param, Query } from '@nestjs/common';
import { GetSnsBaseFriendsByPaginationDto } from './interface/friends.user.interface';
import { BlockUserDto, CreateFreindRequestDto, DeleteFriendDto, acceptFreindRequestDto } from './dto/create.freind.dto';
import { PaginationDto, PostPaginationDto, SearchPaginationDto } from 'src/common/dto/pagination.dto';
import { FriendRepository } from './friends.repository';
import { UserService } from 'src/users/users.service';
import { FriendStatus } from 'src/common/utils/constants';

@Injectable()
export class FriendsService {
    constructor(private readonly freindRepository: FriendRepository,
        private readonly userService : UserService) { }

    async createFriendRequest(userId: string, createFollowDto: CreateFreindRequestDto): Promise<void> {
        const { acceptorId } = createFollowDto

        //find user by userId and if not exist throw 404 error
        await this.userService.findOne(acceptorId)

        const isAlreadyMakeRequest = await this.freindRepository.findRequest(userId, acceptorId)

        if (!isAlreadyMakeRequest) {
            await this.freindRepository.createFreindRequest(userId, createFollowDto);
        }
    }

    async deleteFriendRequest(userId: string, createFollowDto: CreateFreindRequestDto): Promise<void> {
        const { acceptorId } = createFollowDto
        //find user by userId and if not exist throw 404 error
        await this.userService.findOne(acceptorId)

        const isAlreadyMakeRequest = await this.freindRepository.findRequest(userId, acceptorId)

        if (isAlreadyMakeRequest && isAlreadyMakeRequest.status === FriendStatus.FriendRequestSent) {
            await this.freindRepository.delete(isAlreadyMakeRequest.id);
        }
    }

    async acceptFriendRequest(userId: string, createFollowDto: acceptFreindRequestDto): Promise<void> {
        const { requesterId } = createFollowDto
        const request = await this.freindRepository.findRequest(createFollowDto.requesterId, userId)

        if (request) {
            request.status = FriendStatus.Friends
            await this.freindRepository.save(request);
        } else {
            // Throw 404 error
            throw new HttpException('해당 친구 요청을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
        }

        const isAlreadyMakeRequest = await this.freindRepository.findRequest(userId, requesterId)

        if (isAlreadyMakeRequest && isAlreadyMakeRequest.status === FriendStatus.FriendRequestSent) {
            await this.freindRepository.delete(isAlreadyMakeRequest.id);
        }

        return
    }

    async blockUser(userId: string, blockUserDto : BlockUserDto){
        const { blockUserId } = blockUserDto

        await this.freindRepository.deleteFriend(userId, blockUserId)

        await this.freindRepository.createBlockUser(userId, blockUserId)
    }

    async deleteFriend(userId: string, createFollowDto: DeleteFriendDto){
        const { friendId } = createFollowDto

        await this.freindRepository.deleteFriend(userId, friendId)
    }

    async getFreindList(userId: string, specificUserId: string, paginationDto: PostPaginationDto): Promise<GetSnsBaseFriendsByPaginationDto> {
        return await this.freindRepository.getFriendList(userId, specificUserId, paginationDto);
    }

    async getFriendRequestList(userId: string, paginationDto: PostPaginationDto): Promise<GetSnsBaseFriendsByPaginationDto> {
        return await this.freindRepository.getFriendRequestList(userId, paginationDto);
    }

    async getFriendBySearch(userId: string, paginationDto: SearchPaginationDto): Promise<GetSnsBaseFriendsByPaginationDto> {
        return await this.freindRepository.getFriendBySearch(userId, paginationDto);
    }

    async getFriendRequestBySearch(userId: string, paginationDto: SearchPaginationDto): Promise<GetSnsBaseFriendsByPaginationDto> {
        return await this.freindRepository.getFriendRequestBySearch(userId, paginationDto);
    }

}
