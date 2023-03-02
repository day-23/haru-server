import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/entity/user.entity';
import { UserRepository } from 'src/repository/user.repository';
import { UserController } from './users.controller';
import { UserService } from './users.service';

@Module({
    imports:[TypeOrmModule.forFeature([User])],
    controllers: [UserController],
    providers: [UserService, UserRepository]
})
export class UsersModule { }
