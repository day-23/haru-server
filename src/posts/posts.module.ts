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

@Module({
    imports: [AwsModule, HashtagsModule, TypeOrmModule.forFeature([PostTags, Post, Image])],
    controllers: [PostsController],
    providers: [PostService, PostRepository]
})
export class PostsModule { }