import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { FriendsService } from './friends.service';
import { FriendRepository } from './friends.repository';
import { Friend } from 'src/entity/friend.entity';
import { FriendsController } from './friends.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Friend, User]), UsersModule],
    controllers: [FriendsController],
    providers: [FriendsService, FriendRepository]
})
export class FriendsModule { }

