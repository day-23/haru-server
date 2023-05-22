import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { GetSnsBaseUserByPaginationDto, SnsBaseUser } from './interface/friends.user.interface';
import { CreateFreindRequestDto, DeleteFollowDto, DeleteFollowingDto, acceptFreindRequestDto } from './dto/create.freind.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FriendRepository } from './friends.repository';
import { UserService } from 'src/users/users.service';

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

    async acceptFriendRequest(userId: string, createFollowDto: acceptFreindRequestDto): Promise<void> {
        const request = await this.freindRepository.findById(createFollowDto.requestId)

        if (request) {
            request.status = 1
            await this.freindRepository.save(request);
        } else {
            // Throw 404 error
            throw new HttpException('해당 친구 요청을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
        }
        return
    }


    // async getFollowByUserId(userId: string, specificUserId : string, paginationDto: PaginationDto): Promise<GetSnsBaseUserByPaginationDto> {
    //     return await this.freindRepository.findFollowByUserId(userId, specificUserId, paginationDto);
    // }

    // async getFollowingByUserId(userId: string, specificUserId : string, paginationDto: PaginationDto): Promise<GetSnsBaseUserByPaginationDto> {
    //     return await this.freindRepository.findFollowingByUserId(userId, specificUserId, paginationDto);
    // }

    // async deleteFollowing(userId: string, deleteFollowingDto: DeleteFollowingDto): Promise<void> {
    //     return await this.freindRepository.deleteFollowing(userId, deleteFollowingDto);
    // }

    // async deleteFollow(userId: string, deleteFollowDto: DeleteFollowDto): Promise<void> {
    //     return await this.freindRepository.deleteFollow(userId, deleteFollowDto);
    // }
}
