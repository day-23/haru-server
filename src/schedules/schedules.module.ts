import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmsService } from 'src/alarms/alarms.service';
import { AwsModule } from 'src/aws/aws.module';
import { CategoriesService } from 'src/categories/categories.service';
import { Alarm } from 'src/entity/alarm.entity';
import { Category } from 'src/entity/category.entity';
import { Holiday } from 'src/entity/holiday.entity';
import { Image } from 'src/entity/image.entity';
import { Schedule } from 'src/entity/schedule.entity';
import { SubTodo } from 'src/entity/sub-todo.entity';
import { User } from 'src/entity/user.entity';
import { AlarmRepository } from 'src/repository/alarm.repository';
import { CategoryRepository } from 'src/repository/category.repository';
import { ScheduleRepository } from 'src/repository/schedule.repository';
import { UserRepository } from 'src/repository/user.repository';
import { UserService } from 'src/users/users.service';
import { ScheduleController } from './schedules.controller';
import { ScheduleService } from './schedules.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, SubTodo, Category, Alarm, Schedule, Holiday, Image])],
    controllers: [ScheduleController],
    providers: [ScheduleService, ScheduleRepository, CategoriesService, CategoryRepository, AlarmsService, AlarmRepository, UserRepository, UserService]

})
export class SchedulesModule { }
