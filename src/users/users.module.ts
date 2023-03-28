import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AwsModule } from 'src/aws/aws.module';
import { AwsService } from 'src/aws/aws.service';
import { ThrottlerGuard } from 'src/common/guards/throttler.guard';
import { Image } from 'src/entity/image.entity';
import { User } from 'src/entity/user.entity';
import { PostService } from 'src/posts/posts.service';
import { PostRepository } from 'src/posts/post.repository';
import { UserRepository } from 'src/users/user.repository';
import { UserController } from './users.controller';
import { UserService } from './users.service';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [UserController],
    providers: [UserService, UserRepository, {
        provide: APP_GUARD,
        useClass: ThrottlerGuard,
    }]
})
export class UsersModule { }
