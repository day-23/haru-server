import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsService } from 'src/aws/aws.service';
import { Comment } from 'src/entity/comment.entity';
import { Image } from 'src/entity/image.entity';
import { Post } from 'src/entity/post.entity';
import { User } from 'src/entity/user.entity';
import { PostService } from 'src/posts/posts.service';
import { CommentRepository } from 'src/comments/comment.repository';
import { PostRepository } from 'src/posts/post.repository';
import { UserRepository } from 'src/users/user.repository';
import { UserService } from 'src/users/users.service';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, Post, Image, Comment])],
    controllers: [CommentsController],
    providers: [UserService, UserRepository,
        PostService, PostRepository, AwsService,
        CommentsService, CommentRepository
    ]
})
export class CommentsModule {}
