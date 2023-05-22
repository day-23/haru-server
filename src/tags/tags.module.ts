import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { Tag } from 'src/entity/tag.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagRepository } from 'src/tags/tag.repository';
import { TodoTags } from 'src/entity/todo-tags.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Tag, TodoTags])],
    controllers: [TagsController],
    providers: [TagsService, TagRepository],
    exports : [TagsService, TagRepository]
})
export class TagsModule { }
