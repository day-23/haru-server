import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/entity/user.entity";
import { CreateFreindRequestDto } from "./dto/create.freind.dto";
import { ConfigService } from "@nestjs/config";
import { Friend } from "src/entity/freind.entity";

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
            status: 0
        });

        await this.repository.save(newFreindRecord);
    }

    async findRequest(userId: string, acceptorID: string): Promise<Friend> {
        return await this.repository.findOne({ where: { requester: { id: userId }, acceptor: { id: acceptorID } } });
    }

    async findById(id: string): Promise<Friend> {
        return await this.repository.findOne({ where: { id } });
    }
    

    async save(friend: Friend): Promise<void> {
        await this.repository.save(friend);
    }


    // async getFollowersCount(userId: string): Promise<number> {
    //     return await this.repository.count({ where: { following: { id: userId }, relation: true } });
    // }

    // async getFollowingsCount(userId: string): Promise<number> {
    //     return await this.repository.count({ where: { id: userId } });
    // }
}