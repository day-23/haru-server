import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmsModule } from 'src/alarms/alarms.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { Category } from 'src/entity/category.entity';
import { Holiday } from 'src/entity/holiday.entity';
import { Schedule } from 'src/entity/schedule.entity';
import { ScheduleRepository } from 'src/schedules/schedule.repository';
import { ScheduleController } from './schedules.controller';
import { ScheduleService } from './schedules.service';

@Module({
    imports: [AlarmsModule, CategoriesModule, TypeOrmModule.forFeature([Holiday, Schedule])],
    controllers: [ScheduleController],
    providers: [
        {
            provide: 'ScheduleServiceInterface',
            useClass: ScheduleService,
        },
        {
            provide: 'ScheduleRepositoryInterface',
            useClass: ScheduleRepository,
        }
    ],
    exports: ['ScheduleServiceInterface'],
})
export class SchedulesModule { }
