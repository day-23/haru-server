import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subtodo } from 'src/entity/subtodo.entity';
import { Todo } from 'src/entity/todo.entity';
import { TodoRepository } from 'src/todos/todo.repository';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { TagsModule } from 'src/tags/tags.module';

@Module({
    imports: [TagsModule, TypeOrmModule.forFeature([Todo, Subtodo])],
    controllers: [TodosController],
    providers: [TodosService, TodoRepository]
})
export class TodosModule { }
