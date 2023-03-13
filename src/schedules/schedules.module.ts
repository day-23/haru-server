import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alarm } from 'src/entity/alarm.entity';
import { Category } from 'src/entity/schedule-category.entity';
import { Schedule } from 'src/entity/schedule.entity';
import { SubTodo } from 'src/entity/sub-todo.entity';
import { User } from 'src/entity/user.entity';
import { ScheduleRepository } from 'src/repository/schedule.repository';
import { ScheduleController } from './schedules.controller';
import { ScheduleService } from './schedules.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, SubTodo, Category, Alarm, Schedule])],
    controllers: [ScheduleController],
    providers: [ScheduleService, ScheduleRepository]
  
})
export class SchedulesModule {}
