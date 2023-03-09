import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubTodo } from 'src/entity/sub-todo.entity';
import { TagWithTodo } from 'src/entity/tag-with-todo.entity';
import { Tag } from 'src/entity/tag.entity';
import { Todo } from 'src/entity/todo.entity';
import { User } from 'src/entity/user.entity';
import { TagRepository } from 'src/repository/tag.repository';
import { TodoRepository } from 'src/repository/todo.repository';
import { UserRepository } from 'src/repository/user.repository';
import { TagsService } from 'src/tags/tags.service';
import { UserService } from 'src/users/users.service';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

@Module({
    imports: [TypeOrmModule.forFeature([Todo, User, SubTodo, Tag, TagWithTodo])],
    controllers: [TodosController],
    providers: [TodosService, TodoRepository, 
                UserService, UserRepository, 
                TagsService, TagRepository]
})
export class TodosModule { }
