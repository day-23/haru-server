import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, } from '@nestjs/typeorm';
import { BaseAlarm } from 'src/alarms/interface/alarm.interface';
import { Alarm } from 'src/entity/alarm.entity';
import { Schedule } from 'src/entity/schedule.entity';
import { AlarmRepository } from 'src/repository/alarm.repository';
// import { CreateAlarmToScheduleResponse } from 'src/alarms/interface/CreateAlarmToScheduleResponse.interface';
// import { DatePaginationDto } from 'src/common/dto/date-pagination.dto';
// import { Schedule } from 'src/entity/schedule.entity';
import { CategoryRepository } from 'src/repository/category.repository';
import { ScheduleRepository } from 'src/repository/schedule.repository';
import { DataSource, QueryRunner } from 'typeorm';
import { CreateScheduleDto } from './dto/create.schedule.dto';
import { ScheduleResponse } from './interface/schedule.interface';
import { parseScheduleResponse } from './schedule.util';


@Injectable()
export class ScheduleService {
    constructor(private readonly scheduleRepository: ScheduleRepository,
        private readonly alarmRepository: AlarmRepository,
        private readonly categoryRepository: CategoryRepository,
        private dataSource: DataSource
    ) { }

    async createSchedule(userId: string, createScheduleDto: CreateScheduleDto, queryRunner?: QueryRunner): Promise<ScheduleResponse> {
        const { alarms, ...schedule } = createScheduleDto
        const { categoryId } = schedule

        let category = null;
        if (categoryId) {
            category = await this.categoryRepository.findCategoryByUserAndCategoryId(userId, categoryId);
        } else {
            throw new BadRequestException(`categoryId is required`);
        }

        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();
        try {
            // Start the transaction
            await queryRunner.startTransaction();
            const newSchedule = await this.scheduleRepository.createSchedule(userId, schedule, queryRunner);

            let savedAlarms: Alarm[] = []
            if (alarms.length > 0) {
                savedAlarms = await this.alarmRepository.createAlarms(userId, { scheduleId: newSchedule.id, times: alarms }, queryRunner);
            }
            await queryRunner.commitTransaction();
            return parseScheduleResponse(newSchedule, category, savedAlarms)
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new HttpException(
                {
                    message: 'SQL error',
                    error: error.sqlMessage,
                },
                HttpStatus.FORBIDDEN,
            );
        } finally {
            // Release the query runner if it was created in this function
            if (shouldReleaseQueryRunner) {
                await queryRunner.release();
            }
        }
    }

    // async createAlarmToSchedule(userId: string, scheduleId: string, dto: CreateAlarmByTimeDto): Promise<CreateAlarmToScheduleResponse>  {
    //     return this.scheduleRepository.createAlarmToSchedule(userId, scheduleId, dto)
    // }


    // async getHolidaysByDate(userId: string, datePaginationDto: DatePaginationDto) {
    //     return await this.scheduleRepository.findHolidaysByDate(userId, datePaginationDto)
    // }

    // async getSchedulesByDate(userId: string, datePaginationDto: DatePaginationDto) {
    //     return await this.scheduleRepository.findSchedulesByDate(userId, datePaginationDto)
    // }


    // async getSchedulesBySearch(userId: string, content: string) {
    //     return await this.scheduleRepository.findSchedulesBySearch(userId, content)
    // }

    // async updateSchedule(userId: string, scheduleId: string, schedule: UpdateScheduleDto): Promise<Schedule> {
    //     return this.scheduleRepository.updateSchedule(userId, scheduleId, schedule);
    // }

    // async deleteSchedule(userId: string, scheduleId: string): Promise<void> {
    //     return this.scheduleRepository.deleteSchedule(userId, scheduleId);
    // }
}
