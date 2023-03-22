import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/entity/comment.entity';
import { Post } from 'src/entity/post.entity';
import { TagWithPost } from 'src/entity/tag-with-post.entity';
import { Tag } from 'src/entity/tag.entity';
import { User } from 'src/entity/user.entity';
import { PostRepository } from 'src/repository/post.repository';
import { TagRepository } from 'src/repository/tag.repository';
import { UserRepository } from 'src/repository/user.repository';
import { TagsService } from 'src/tags/tags.service';
import { UserService } from 'src/users/users.service';
import { PostsController } from './posts.controller';
import { PostService } from './posts.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, Tag, TagWithPost, Post, Comment])],
    controllers: [PostsController],
    providers: [UserService, UserRepository,
        TagsService, TagRepository,
        PostService, PostRepository]
})
export class PostsModule { }