import { Follow } from "src/entity/follow.entity";
import { FollowRepositoryInterface } from "./interface/follow.repository.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/entity/user.entity";
import { SnsBaseUser } from "./interface/follow.user.interface";
import { CreateFollowDto } from "./dto/create.follow.dto";
import { ConfigService } from "@nestjs/config";

export class FollowRepository implements FollowRepositoryInterface {
    public readonly S3_URL: string;
    constructor(
        @InjectRepository(Follow) private readonly repository: Repository<Follow>,
        private readonly configService: ConfigService
    ) { 
        this.S3_URL = this.configService.get('AWS_S3_URL'); // nest-s3
    }

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
        const ret = await this.repository
            .createQueryBuilder('follow')
            .leftJoinAndSelect('follow.following', 'following')
            .leftJoinAndSelect('following.profileImages', 'profileImages')
            .select([
                'follow.id',
                'following.id',
                'following.name',
                'following.email',
                'profileImages.id',
                'profileImages.url',
            ])
            .where('follow.follow = :userId', { userId })
            .getMany();

        return ret.map((follow) => {
            return {
                id: follow.following.id,
                name: follow.following.name,
                email: follow.following.email,
                profileImage: follow.following?.profileImages?.length > 0 ? this.S3_URL + follow.following.profileImages[0].url : null,
            }
        })
    }

    async findFollowingByUserId(userId: string): Promise<SnsBaseUser[]> {
        const ret = await this.repository
            .createQueryBuilder('follow')
            .leftJoinAndSelect('follow.following', 'following')
            .leftJoinAndSelect('following.profileImages', 'profileImages')
            .select([
                'follow.id',
                'following.id',
                'following.name',
                'following.email',
                'profileImages.id',
                'profileImages.url',
            ])
            .where('follow.follow = :userId', { userId })
            .getMany();

        return ret.map((follow) => {
            return {
                id: follow.following.id,
                name: follow.following.name,
                email: follow.following.email,
                profileImage: follow.following?.profileImages?.length > 0 ? this.S3_URL + follow.following.profileImages[0].url : null,
            }
        })
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