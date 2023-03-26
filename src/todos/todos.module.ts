import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmsService } from 'src/alarms/alarms.service';
import { Alarm } from 'src/entity/alarm.entity';
import { Subtodo } from 'src/entity/subtodo.entity';
import { TodoTags } from 'src/entity/todo-tags.entity';
import { Tag } from 'src/entity/tag.entity';
import { Todo } from 'src/entity/todo.entity';
import { User } from 'src/entity/user.entity';
import { AlarmRepository } from 'src/repository/alarm.repository';
import { TagRepository } from 'src/repository/tag.repository';
import { TodoRepository } from 'src/repository/todo.repository';
import { UserRepository } from 'src/repository/user.repository';
import { TagsService } from 'src/tags/tags.service';
import { UserService } from 'src/users/users.service';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

@Module({
    imports: [TypeOrmModule.forFeature([Todo, User, Subtodo, Tag, TodoTags, Alarm])],
    controllers: [TodosController],
    providers: [TodosService, TodoRepository, 
                UserService, UserRepository, 
                TagsService, TagRepository, AlarmsService, AlarmRepository]
})
export class TodosModule { }
