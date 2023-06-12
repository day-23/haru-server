import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/entity/user.entity";
import { CreateFreindRequestDto } from "./dto/create.freind.dto";
import { ConfigService } from "@nestjs/config";
import { Friend } from "src/entity/friend.entity";
import { PostPaginationDto, SearchPaginationDto, createPaginationObject } from "src/common/dto/pagination.dto";
import { calculateSkip } from "src/posts/post.util";
import { FriendStatus } from "src/common/utils/constants";
import { GetSnsBaseFriendsByPaginationDto } from "./interface/friends.user.interface";

export class FriendRepository{
    public readonly S3_URL: string;
    constructor(
        @InjectRepository(Friend) private readonly repository: Repository<Friend>,
        private readonly configService: ConfigService
    ) {
        this.S3_URL = this.configService.get('AWS_S3_URL'); // nest-s3
    }

    async createFreindRequest(userId: string, createFollowDto: CreateFreindRequestDto): Promise<void> {
        const { acceptorId } = createFollowDto

        const newFreindRecord = this.repository.create({
            requester: new User({ id: userId }),
            acceptor: new User({ id: acceptorId }),
            status: FriendStatus.FriendRequestSent
        });

        await this.repository.save(newFreindRecord);
    }

    async findRequest(requesterId: string, acceptorID: string): Promise<Friend> {
        return await this.repository.findOne({ where: { requester: { id: requesterId }, acceptor: { id: acceptorID } } });
    }

    async findById(id: string): Promise<Friend> {
        return await this.repository.findOne({ where: { id } });
    }


    async save(friend: Friend): Promise<void> {
        await this.repository.save(friend);
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete({ id });
    }


    //delete friend by userId and acceptorId
    async deleteFriend(userId: string, acceptorId: string): Promise<void> {
        await this.repository.delete({ requester: { id: userId }, acceptor: { id: acceptorId } });
        await this.repository.delete({ requester: { id: acceptorId }, acceptor: { id: userId } });
    }

    //create block user by userId and blockUserId
    async createBlockUser(userId: string, blockUserId: string): Promise<void> {
        const newFreindRecord = this.repository.create({
            requester: new User({ id: userId }),
            acceptor: new User({ id: blockUserId }),
            status: FriendStatus.Blocked
        });

        await this.repository.save(newFreindRecord);
    }



    //친구 목록 페이지네이션 해서 받기
    async getFriendList(userId: string, specificUserId: string, postPaginationDto: PostPaginationDto): Promise<GetSnsBaseFriendsByPaginationDto> {
        const { page, limit, lastCreatedAt } = postPaginationDto;
        const skip = calculateSkip(page, limit)

        const specificUserFriends = await this.repository.query(`
            SELECT user.id, user.name, user.email, user.profile_image_url, friend.created_at
            FROM friend
            LEFT JOIN user 
            ON user.id = CASE WHEN friend.requester_id = ? THEN friend.acceptor_id ELSE friend.requester_id END
            WHERE ((friend.requester_id = ? OR friend.acceptor_id = ?) AND friend.status = ?)
            AND friend.created_at < ?
            ORDER BY friend.created_at DESC
            LIMIT ? OFFSET ?
            `,
            [specificUserId, specificUserId, specificUserId, FriendStatus.Friends, lastCreatedAt, limit, skip]
        );
        
        const specificUserFriendsIds = specificUserFriends.map((friend) => friend.id)

        let commonFriends = [];
        if (specificUserFriends.length > 0) {
            commonFriends = await this.repository.query(`
            SELECT user.id, user.name, user.email, user.profile_image_url, friend.status, friend.requester_id, friend.acceptor_id, friend.created_at
            FROM friend
            LEFT JOIN user
            ON user.id = CASE WHEN friend.requester_id = ? THEN friend.acceptor_id ELSE friend.requester_id END
            WHERE (friend.requester_id = ? OR friend.acceptor_id = ?)
            AND user.id IN (?)
            ORDER BY friend.created_at DESC
            `,
                [userId, userId, userId, specificUserFriendsIds]
            );
        }

        console.log(commonFriends)

        const commonFriendsIds = commonFriends.map((friend) => friend.id)

        //make dictionary for common friends key is id and value is status
        const commonFriendsDict = {}
        commonFriends.forEach((friend) => {
            commonFriendsDict[friend.id] = friend.status

            if (friend.status == 1 && friend.acceptor_id == userId) {
                commonFriendsDict[friend.id] = 3
            }
        })

        const friendList = specificUserFriends.map((friend) => {
            return {
                id : friend.id,
                name : friend.name,
                profileImageUrl : friend.profile_image_url,
                friendStatus : commonFriendsIds.includes(friend.id) ? commonFriendsDict[friend.id] : FriendStatus.NotFriends,
                createdAt : friend.created_at
            }
        })

        const count = await this.countFriendsByStatus(specificUserId, FriendStatus.Friends)

        return {
            data: friendList,
            pagination: createPaginationObject(count, limit, page)
        }
    }


    async countFriendsByStatus(userId: string, status: number): Promise<number> {
        const count = await this.repository
            .createQueryBuilder("friend")
            .where("(friend.requester_id = :userId OR friend.acceptor_id = :userId)\
            AND friend.status = :status",
                { userId, status }) // Consider the 'accepted' friends
            .getCount();

        return count;
    }

    async countFriendsRequestByStatus(userId: string): Promise<number> {
        const count = await this.repository
            .createQueryBuilder("friend")
            .where("friend.acceptor_id = :userId AND friend.status = :status",
                { userId, status : FriendStatus.FriendRequestSent })
            .getCount();

        return count;
    }

    //친구 신청 목록 페이지네이션 해서 받기
    async getFriendRequestList(userId: string, postPaginationDto: PostPaginationDto): Promise<GetSnsBaseFriendsByPaginationDto> {
        const { page, limit, lastCreatedAt } = postPaginationDto;
        const skip = calculateSkip(page, limit)

        const result = await this.repository.query(`
            SELECT user.id, user.name, user.email, user.profile_image_url, friend.created_at
            FROM friend
            LEFT JOIN user 
            ON user.id = CASE WHEN friend.requester_id = ? THEN friend.acceptor_id ELSE friend.requester_id END
            WHERE (friend.acceptor_id = ? AND friend.status = ?)
            AND friend.created_at < ?
            ORDER BY friend.created_at DESC
            LIMIT ? OFFSET ?
            `,
            [userId, userId, FriendStatus.FriendRequestSent, lastCreatedAt, limit, skip]
        );
        
        const friendList = result.map((friend) => {
            return {
                id : friend.id,
                name : friend.name,
                profileImageUrl : friend.profile_image_url,
                friendStatus : FriendStatus.FriendRequestSent,
                createdAt : friend.created_at
            }
        })

        const count = await this.countFriendsRequestByStatus(userId)

        return {
            data: friendList,
            pagination: createPaginationObject(count, limit, page)
        }
    }


    //친구 신청 목록 페이지네이션 해서 받기
    async getFriendBySearch(userId: string, postPaginationDto: SearchPaginationDto): Promise<GetSnsBaseFriendsByPaginationDto> {
        const { page, limit, lastCreatedAt, name } = postPaginationDto;
        const skip = calculateSkip(page, limit)

        if (name === null || name === undefined || name.length == 0) {
            return {
                data: [],
                pagination: createPaginationObject(0, limit, page)
            }
        }

        const result = await this.repository.query(`
            SELECT user.id, user.name, user.email, user.profile_image_url, friend.created_at
            FROM friend
            LEFT JOIN user 
            ON user.id = CASE WHEN friend.requester_id = ? THEN friend.acceptor_id ELSE friend.requester_id END
            WHERE (friend.requester_id = ? OR friend.acceptor_id = ?)
            AND friend.status = ?
            AND friend.created_at < ?
            AND (user.name LIKE ? OR user.haru_id LIKE ?)
            ORDER BY friend.created_at DESC
            LIMIT ? OFFSET ?
            `,
            [userId, userId, userId, FriendStatus.Friends, lastCreatedAt, `%${name}%`, `%${name}%`, limit, skip]
        );

        const friendList = result.map((friend) => {
            return {
                id: friend.id,
                name: friend.name,
                profileImageUrl: friend.profile_image_url,
                friendStatus: FriendStatus.Friends,
                createdAt: friend.created_at
            }
        })

        const count = result.length

        return {
            data: friendList,
            pagination: createPaginationObject(count, limit, page)
        }
    }

    

    //친구 신청 목록 페이지네이션 해서 받기
    async getFriendRequestBySearch(userId: string, postPaginationDto: SearchPaginationDto): Promise<GetSnsBaseFriendsByPaginationDto> {
        const { page, limit, lastCreatedAt, name } = postPaginationDto;
        const skip = calculateSkip(page, limit)

        if (name === null || name === undefined || name.length == 0) {
            return {
                data: [],
                pagination: createPaginationObject(0, limit, page)
            }
        }

        const result = await this.repository.query(`
            SELECT user.id, user.name, user.email, user.profile_image_url, friend.created_at
            FROM friend
            LEFT JOIN user 
            ON user.id = CASE WHEN friend.requester_id = ? THEN friend.acceptor_id ELSE friend.requester_id END
            WHERE (friend.requester_id = ? OR friend.acceptor_id = ?)
            AND friend.status = ?
            AND friend.created_at < ?
            AND (user.name LIKE ? OR user.haru_id LIKE ?)
            ORDER BY friend.created_at DESC
            LIMIT ? OFFSET ?
            `,
            [userId, userId, userId, FriendStatus.FriendRequestSent, lastCreatedAt, `%${name}%`, `%${name}%`, limit, skip]
        );

        const friendList = result.map((friend) => {
            return {
                id: friend.id,
                name: friend.name,
                profileImageUrl: friend.profile_image_url,
                friendStatus: FriendStatus.FriendRequestSent,
                createdAt: friend.created_at
            }
        })

        const count = result.length

        return {
            data: friendList,
            pagination: createPaginationObject(count, limit, page)
        }
    }
}