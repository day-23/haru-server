import { Follow } from "src/entity/follow.entity";
import { FollowRepositoryInterface } from "./interface/follow.repository.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/entity/user.entity";
import { SnsBaseUser } from "./interface/follow.user.interface";
import { CreateFollowDto } from "./dto/create.follow.dto";

export class FollowRepository implements FollowRepositoryInterface {
    constructor(
        @InjectRepository(Follow) private readonly repository: Repository<Follow>
    ) { }

    async createFollowing(userId: string, createFollowDto: CreateFollowDto): Promise<void> {
        const {followId} = createFollowDto
        const follow = new Follow();
        follow.follow = new User({ id: userId });
        follow.following = new User({ id: followId });
        follow.relation = true
        const ret = await this.repository.save(follow);
        console.log(userId, ret)
    }

    async findFollowByUserId(userId: string): Promise<SnsBaseUser[]> {
        return await this.repository.createQueryBuilder('follow')
            .select(['follow.followId', 'user.nickname', 'user.profileImage'])
            .leftJoin('follow.follow', 'user')
            .where('follow.userId = :userId', { userId })
            .getRawMany();
    }

    async findFollowingByUserId(userId: string): Promise<SnsBaseUser[]> {
        return await this.repository.createQueryBuilder('follow')
            .select(['follow.userId', 'user.nickname', 'user.profileImage'])
            .leftJoin('follow.following', 'user')
            .where('follow.followId = :userId', { userId })
            .getRawMany();
    }


    async deleteFollow(userId: string, followId: string): Promise<void> {
        await this.repository.delete({ follow: { id: userId }, following: { id: followId } });
    }

    async getFollowers(userId: string): Promise<Follow[]> {
        return await this.repository.find({ where: { follow: { id: userId } } });
    }

    async getFollowings(userId: string): Promise<Follow[]> {
        return await this.repository.find({ where: { following: { id: userId } } });
    }

    async isFollowing(userId: string, followId: string): Promise<boolean> {
        const follow = await this.repository.findOne({ where: { follow: { id: userId }, following: { id: followId } } });
        return follow ? true : false;
    }

    async getFollowersCount(userId: string): Promise<number> {
        return await this.repository.count({ where: { following: { id: userId }, relation : true } });
    }

    async getFollowingsCount(userId: string): Promise<number> {
        return await this.repository.count({ where: { id: userId } });
    }

    async getFollowersWithPagination(userId: string, page: number, limit: number): Promise<Follow[]> {
        return await this.repository.find({
            where: { follow: { id: userId } },
            skip: page * limit,
            take: limit
        });
    }

    async getFollowingsWithPagination(userId: string, page: number, limit: number): Promise<Follow[]> {
        return await this.repository.find({
            where: { follow: { id: userId } },
            skip: page * limit,
            take: limit
        });
    }
}