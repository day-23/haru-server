import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from 'src/entity/todo.entity';
import { User } from 'src/entity/user.entity';
import { TodoRepository } from 'src/repository/todo.repository';
import { UserRepository } from 'src/repository/user.repository';
import { UserService } from 'src/users/users.service';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

@Module({
    imports: [TypeOrmModule.forFeature([Todo, User])],
    controllers: [TodosController],
    providers: [TodosService, TodoRepository, UserService, UserRepository]
})
export class TodosModule { }
