import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { Tag } from 'src/entity/tag.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagRepository } from 'src/tags/tag.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Tag])],
    controllers: [TagsController],
    providers: [TagsService, TagRepository],
    exports : [TagsService, TagRepository]
})
export class TagsModule { }
