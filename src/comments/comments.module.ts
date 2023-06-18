import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/entity/comment.entity';
import { CommentRepository } from 'src/comments/comment.repository';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Post } from 'src/entity/post.entity';
import { UsersModule } from 'src/users/users.module';
import { Friend } from 'src/entity/friend.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Comment, Post, Friend]), UsersModule],
    controllers: [CommentsController],
    providers: [CommentsService, CommentRepository]
})
export class CommentsModule {}
