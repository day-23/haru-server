import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsService } from 'src/aws/aws.service';
import { Comment } from 'src/entity/comment.entity';
import { PostImage } from 'src/entity/post-image.entity';
import { Post } from 'src/entity/post.entity';
import { User } from 'src/entity/user.entity';
import { PostService } from 'src/posts/posts.service';
import { CommentRepository } from 'src/repository/comment.repository';
import { PostRepository } from 'src/repository/post.repository';
import { UserRepository } from 'src/repository/user.repository';
import { UserService } from 'src/users/users.service';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, Post, PostImage, Comment])],
    controllers: [CommentsController],
    providers: [UserService, UserRepository,
        PostService, PostRepository, AwsService,
        CommentsService, CommentRepository
    ]
})
export class CommentsModule {}
