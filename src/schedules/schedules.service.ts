import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { DatePaginationDto } from 'src/common/dto/date-pagination.dto';
import { AlarmRepository } from 'src/alarms/alarm.repository';
import { CategoryRepository } from 'src/categories/category.repository';
import { ScheduleRepository } from 'src/schedules/schedule.repository';
import { DataSource, QueryRunner } from 'typeorm';
import { CreateScheduleDto, UpdateScheduleBySplitDto } from './dto/create.schedule.dto';
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

        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();
        try {
            // Start the transaction
            if (!queryRunner.isTransactionActive) {
                await queryRunner.startTransaction();
            }

            const category = await this.categoryRepository.findCategoryByUserAndCategoryId(userId, categoryId);
            const newSchedule = await this.scheduleRepository.createSchedule(userId, schedule, queryRunner);
            const savedAlarms = await this.alarmRepository.createAlarms(userId, { scheduleId: newSchedule.id, times: alarms }, queryRunner);

            if (shouldReleaseQueryRunner) {
                await queryRunner.commitTransaction();
            }

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

    async updateSchedule(userId: string, scheduleId: string, createScheduleDto: CreateScheduleDto, queryRunner?: QueryRunner): Promise<ScheduleResponse> {
        //find schedule by scheduleId, if not find then throw error
        const { alarms, ...schedule } = createScheduleDto
        const { categoryId } = schedule

        const scheduleToUpdate = await this.scheduleRepository.findScheduleByUserAndScheduleId(userId, scheduleId);
        if (!scheduleToUpdate) {
            throw new NotFoundException(`Schedule with id ${scheduleId} not found`);
        }
        
        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();
        try {
            // Start the transaction
            await queryRunner.startTransaction();

            const category = await this.categoryRepository.findCategoryByUserAndCategoryId(userId, categoryId);
            const updatedSchedule = await this.scheduleRepository.updateSchedule(userId, scheduleId, schedule, queryRunner);
            const savedAlarms = await this.alarmRepository.updateAlarms(userId, { scheduleId: updatedSchedule.id, times: alarms }, queryRunner);

            await queryRunner.commitTransaction();
            return parseScheduleResponse(updatedSchedule, category, savedAlarms)
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw new HttpException(
                {
                    message: 'SQL error',
                    error: error.sqlMessage,
                },
                HttpStatus.FORBIDDEN,
            );
        }
        finally {
            // Release the query runner if it was created in this function
            if (shouldReleaseQueryRunner) {
                await queryRunner.release();
            }
        }
    }

    async updateScheduleBySplit(userId: string, scheduleId: string, updateScheduleBySplitDto: UpdateScheduleBySplitDto, queryRunner?: QueryRunner): Promise<ScheduleResponse> {
        //find schedule by scheduleId, if not find then throw error
        const { changedDate, ...createScheduleDto} = updateScheduleBySplitDto

        const scheduleToUpdate = await this.scheduleRepository.findScheduleByUserAndScheduleId(userId, scheduleId);
        if (!scheduleToUpdate) {
            throw new NotFoundException(`Schedule with id ${scheduleId} not found`);
        }

        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();
        try {
            // Start the transaction
            await queryRunner.startTransaction();
            
            //새로 생성된 스케줄
            const [ret, first, second] = await Promise.all([
                this.createSchedule(userId, createScheduleDto, queryRunner),
                this.scheduleRepository.updateSchedulePartial(scheduleToUpdate, {repeatEnd : changedDate}, queryRunner),
                this.scheduleRepository.updateSchedulePartial(scheduleToUpdate, {repeatStart : changedDate}, queryRunner)
            ])
            await queryRunner.commitTransaction();
            return ret
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw new HttpException(
                {
                    message: 'SQL error',
                    error: error.sqlMessage,
                },
                HttpStatus.FORBIDDEN,
            );
        }
        finally {
            // Release the query runner if it was created in this function
            if (shouldReleaseQueryRunner) {
                await queryRunner.release();
            }
        }
    }

    async deleteSchedule(userId: string, scheduleId: string): Promise<void> {
        return this.scheduleRepository.deleteSchedule(userId, scheduleId);
    }

    async getSchedulesByDate(userId: string, datePaginationDto: DatePaginationDto) {
        return await this.scheduleRepository.findSchedulesByDate(userId, datePaginationDto)
    }

    async getSchedulesBySearch(userId: string, content: string) {
        return await this.scheduleRepository.findSchedulesBySearch(userId, content)
    }

    async getHolidaysByDate(userId: string, datePaginationDto: DatePaginationDto) {
        return await this.scheduleRepository.findHolidaysByDate(userId, datePaginationDto)
    }

}
