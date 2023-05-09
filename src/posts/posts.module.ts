import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsModule } from 'src/aws/aws.module';
import { Image } from 'src/entity/image.entity';
import { Post } from 'src/entity/post.entity';
import { PostTags } from 'src/entity/post-tags.entity';
import { PostRepository } from 'src/posts/post.repository';
import { PostsController } from './posts.controller';
import { PostService } from './posts.service';
import { HashtagsModule } from 'src/hashtags/hashtags.module';
import { Liked } from 'src/entity/liked.entity';
import { Comment } from 'src/entity/comment.entity';
import { User } from 'src/entity/user.entity';
import { Report } from 'src/entity/report.entity';
import { Template } from 'src/entity/template.entity';
import { UserRelationship } from 'src/entity/follow.entity';

@Module({
    imports: [AwsModule, HashtagsModule, TypeOrmModule.forFeature([PostTags, Post, Image, Template, Liked, Comment, User, Report, UserRelationship])],
    controllers: [PostsController],
    providers: [PostService, PostRepository]
})
export class PostsModule { }