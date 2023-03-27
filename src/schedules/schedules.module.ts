import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/entity/category.entity';
import { Holiday } from 'src/entity/holiday.entity';
import { Schedule } from 'src/entity/schedule.entity';
import { ScheduleRepository } from 'src/repository/schedule.repository';
import { ScheduleController } from './schedules.controller';
import { ScheduleService } from './schedules.service';

@Module({
    imports: [TypeOrmModule.forFeature([Holiday, Schedule])],
    controllers: [ScheduleController],
    providers: [ScheduleService, ScheduleRepository]

})
export class SchedulesModule { }
