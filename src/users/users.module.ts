import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard } from 'src/common/guards/throttler.guard';
import { User } from 'src/entity/user.entity';
import { UserRepository } from 'src/users/user.repository';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [TypeOrmModule.forFeature([User]), HttpModule],
    controllers: [UserController],
    providers: [UserService, UserRepository, {
        provide: APP_GUARD,
        useClass: ThrottlerGuard,
    }],
    exports: [UserService]
})
export class UsersModule { }
