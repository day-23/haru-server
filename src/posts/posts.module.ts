import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsModule } from 'src/aws/aws.module';
import { AwsService } from 'src/aws/aws.service';
import { Comment } from 'src/entity/comment.entity';
import { Image } from 'src/entity/image.entity';
import { Post } from 'src/entity/post.entity';
import { PostTags } from 'src/entity/post-tags.entity';
import { Tag } from 'src/entity/tag.entity';
import { PostRepository } from 'src/posts/post.repository';
import { PostsController } from './posts.controller';
import { PostService } from './posts.service';

@Module({
    imports: [TypeOrmModule.forFeature([PostTags, Post, Image]), AwsModule],
    controllers: [PostsController],
    providers: [PostService, PostRepository]
})
export class PostsModule { }