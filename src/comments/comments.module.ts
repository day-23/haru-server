import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/entity/comment.entity';
import { CommentRepository } from 'src/comments/comment.repository';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Post } from 'src/entity/post.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Comment, Post])],
    controllers: [CommentsController],
    providers: [CommentsService, CommentRepository]
})
export class CommentsModule {}
