import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subtodo } from 'src/entity/subtodo.entity';
import { Todo } from 'src/entity/todo.entity';
import { TodoRepository } from 'src/todos/todo.repository';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { TagsModule } from 'src/tags/tags.module';
import { SchedulesModule } from 'src/schedules/schedules.module';
import { TodoTags } from 'src/entity/todo-tags.entity';

@Module({
    imports: [SchedulesModule, TagsModule, TypeOrmModule.forFeature([Todo, Subtodo, TodoTags])],
    controllers: [TodosController],
    providers: [TodosService, TodoRepository],
    exports: [TodosService]
})
export class TodosModule { }
