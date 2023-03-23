import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { Tag } from 'src/entity/tag.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagRepository } from 'src/repository/tag.repository';
import { User } from 'src/entity/user.entity';
import { UserService } from 'src/users/users.service';
import { UserRepository } from 'src/repository/user.repository';
import { AwsModule } from 'src/aws/aws.module';
import { Image } from 'src/entity/image.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Tag, User])],
    controllers: [TagsController],
    providers: [TagsService, TagRepository, UserService, UserRepository],
})
export class TagsModule { }
