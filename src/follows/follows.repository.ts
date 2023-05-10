import { UserRelationship } from "src/entity/follow.entity";
import { FollowRepositoryInterface } from "./interface/follow.repository.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/entity/user.entity";
import { GetSnsBaseUserByPaginationDto, SnsBaseUser } from "./interface/follow.user.interface";
import { CreateFollowDto, DeleteFollowDto, DeleteFollowingDto } from "./dto/create.follow.dto";
import { ConfigService } from "@nestjs/config";
import { NotFoundException } from "@nestjs/common";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class FollowRepository implements FollowRepositoryInterface {
    public readonly S3_URL: string;
    constructor(
        @InjectRepository(UserRelationship) private readonly repository: Repository<UserRelationship>,
        private readonly configService: ConfigService
    ) {
        this.S3_URL = this.configService.get('AWS_S3_URL'); // nest-s3
    }

    async createFollowing(userId: string, createFollowDto: CreateFollowDto): Promise<void> {
        const { followId } = createFollowDto

        const userRelationship = new UserRelationship();
        userRelationship.following = new User({ id: userId });
        userRelationship.follower = new User({ id: followId });
        userRelationship.relation = true
        const ret = await this.repository.save(userRelationship);
    }

    /* 팔로잉 목록 보기 */
    async findFollowingByUserId(userId: string, specificUserId: string, paginationDto: PaginationDto): Promise<GetSnsBaseUserByPaginationDto> {
        const { page, limit } = paginationDto
        const skip = (page - 1) * limit;

        const [followers, count] = await this.repository
            .createQueryBuilder('userRelationship')
            .leftJoinAndSelect('userRelationship.following', 'following')
            .leftJoinAndSelect('userRelationship.follower', 'follower')
            .leftJoinAndSelect('follower.profileImages', 'profileImages')
            .select([
                'userRelationship.id',
                'userRelationship.createdAt',
                'follower.id',
                'follower.name',
                'follower.email',
                'profileImages.id',
                'profileImages.url',
            ])
            .where('userRelationship.following = :specificUserId', { specificUserId })
            .andWhere('userRelationship.follower != :userId', { userId })
            .orderBy('userRelationship.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const followersIds = [followers.map((userRelationship) => userRelationship.follower.id)]

        let followingsByUser = [];
        if (followers.length > 0) {
            // find common followings
            followingsByUser = await this.repository
                .createQueryBuilder('userRelationship')
                .leftJoinAndSelect('userRelationship.following', 'following')
                .leftJoinAndSelect('userRelationship.follower', 'follower')
                .leftJoinAndSelect('follower.profileImages', 'profileImages')
                .select([
                    'userRelationship.id',
                    'follower.id',
                ])
                .where('userRelationship.following = :userId', { userId })
                .andWhere('userRelationship.follower IN (:...followersIds)', { followersIds })
                .getMany();
        }

        const commonFollowings = followingsByUser.map((userRelationship) => userRelationship.follower.id)
        const totalPages = Math.ceil(count / limit);

        const ret = followers.map((userRelationship) => {
            return {
                id: userRelationship.follower.id,
                name: userRelationship.follower.name,
                email: userRelationship.follower.email,
                profileImage: userRelationship.follower?.profileImages?.length > 0 ? this.S3_URL + userRelationship.follower.profileImages[0].url : null,
                isFollowing: commonFollowings.includes(userRelationship.follower.id)
            }
        })

        return {
            data: ret,
            pagination: {
                totalItems: count,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: totalPages,
            },
        }
    }
    
    /* 팔로우 목록 보기 */
    async findFollowByUserId(userId: string, specificUserId: string , paginationDto: PaginationDto): Promise<GetSnsBaseUserByPaginationDto> {
        const { page, limit } = paginationDto
        const skip = (page - 1) * limit;

        console.log('heres')

        const [followings, count] = await this.repository
            .createQueryBuilder('userRelationship')
            .leftJoinAndSelect('userRelationship.follower', 'follower')
            .leftJoinAndSelect('userRelationship.following', 'following')
            .leftJoinAndSelect('follower.profileImages', 'profileImages')
            .select([
                'userRelationship.id',
                'userRelationship.createdAt',
                'following.id',
                'following.name',
                'following.email',
                'profileImages.id',
                'profileImages.url',
            ])
            .where('userRelationship.follower = :specificUserId', { specificUserId })
            .andWhere('userRelationship.following != :userId', { userId })
            .orderBy('userRelationship.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const followingsIds = [followings.map((userRelationship) => userRelationship.following.id)]

        let followingsByUser = [];
        if (followings.length > 0) {
            //find common followings
            followingsByUser = await this.repository
                .createQueryBuilder('userRelationship')
                .leftJoinAndSelect('userRelationship.following', 'following')
                .leftJoinAndSelect('userRelationship.follower', 'follower')
                .leftJoinAndSelect('follower.profileImages', 'profileImages')
                .select([
                    'userRelationship.id',
                    'follower.id',
                ])
                .where('userRelationship.following = :userId', { userId })
                .andWhere('userRelationship.follower IN (:...followingsIds)', { followingsIds })
                .getMany();
        }

        const commonFollowings = followingsByUser.map((userRelationship) => userRelationship.follower.id)
        const totalPages = Math.ceil(count / limit);

        const ret = followings.map((userRelationship) => {
            return {
                id: userRelationship.following.id,
                name: userRelationship.following.name,
                email: userRelationship.following.email,
                profileImage: userRelationship.following?.profileImages?.length > 0 ? this.S3_URL + userRelationship.following.profileImages[0].url : null,
                isFollowing: commonFollowings.includes(userRelationship.following.id)
            }
        })

        return {
            data: ret,
            pagination: {
                totalItems: count,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: totalPages,
            },
        }
    }

    async deleteFollowing(userId: string, deleteFollowingDto: DeleteFollowingDto): Promise<void> {
        const { followingId } = deleteFollowingDto
        const ret = await this.repository.delete({ following: { id: userId }, follower: { id: followingId } });

        if (ret.affected === 0) {
            throw new NotFoundException(`Follow not found`);
        }
    }

    async deleteFollow(userId: string, deleteFollowDto: DeleteFollowDto): Promise<void> {
        const { followId } = deleteFollowDto
        const ret = await this.repository.delete({ following: { id: followId }, follower: { id: userId } });
        if (ret.affected === 0) {
            throw new NotFoundException(`Follow not found`);
        }
    }

    async getFollowers(userId: string): Promise<UserRelationship[]> {
        return await this.repository.find({ where: { follower: { id: userId } } });
    }

    async getFollowings(userId: string): Promise<UserRelationship[]> {
        return await this.repository.find({ where: { following: { id: userId } } });
    }

    async isFollowing(userId: string, followId: string): Promise<boolean> {
        const follow = await this.repository.findOne({ where: { follower: { id: followId }, following: { id: userId } } });
        return follow ? true : false;
    }

    async getFollowersCount(userId: string): Promise<number> {
        return await this.repository.count({ where: { following: { id: userId }, relation: true } });
    }

    async getFollowingsCount(userId: string): Promise<number> {
        return await this.repository.count({ where: { id: userId } });
    }
}