import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DatePaginationDto, DateTimePaginationDto } from 'src/common/dto/date-pagination.dto';
import { AlarmRepository } from 'src/alarms/alarm.repository';
import { CategoryRepository } from 'src/categories/category.repository';
import { DataSource, QueryRunner } from 'typeorm';
import { CreateScheduleDto, UpdateScheduleBySplitDto, UpdateSchedulePartialDto } from './dto/create.schedule.dto';
import { GetHolidaysByDate, GetSchedulesAndTodos, GetSchedulesAndTodosResponseByDate, GetSchedulesResponseAndHolidaysByDate, GetSchedulesResponseByDate, ScheduleResponse } from './interface/schedule.interface';
import { existingScheduleToCreateScheduleDto, getPreRepeatEnd, parseScheduleResponse } from './schedule.util';
import { Schedule } from 'src/entity/schedule.entity';
import { getDatePlusMinusOneDay, getMinusOneDay } from 'src/common/makeDate';
import { RepeatScheduleSplitBackDto, RepeatScheduleSplitFrontDto, RepeatScheduleSplitMiddleDto, UpdateRepeatBackScheduleBySplitDto, UpdateRepeatFrontScheduleBySplitDto, UpdateRepeatMiddleScheduleBySplitDto } from './dto/repeat.schedule.dto';
import { ScheduleServiceInterface } from './interface/schedule.service.interface';
import { ScheduleRepositoryInterface } from './interface/schedule.repository.interface';


@Injectable()
export class ScheduleService implements ScheduleServiceInterface{
    constructor(@Inject('ScheduleRepositoryInterface') private readonly scheduleRepository: ScheduleRepositoryInterface,
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

    async createNewNextRepeatSchedule(userId: string, schedule: Schedule, nextRepeatStart: Date, queryRunner?: QueryRunner): Promise<ScheduleResponse> {
        const parent = schedule.parent ? schedule.parent.id : schedule.id
        //schedule to createScheduleDto
        const createScheduleDto = existingScheduleToCreateScheduleDto(schedule)
        /* 다음 할일을 만듦 */
        return await this.createSchedule(userId, { ...createScheduleDto, repeatStart: nextRepeatStart, repeatEnd: schedule.repeatEnd, parent }, queryRunner)
    }
    ///
    async getSchedulesByDate(userId: string, dateTimePaginationDto: DateTimePaginationDto): Promise<GetSchedulesResponseAndHolidaysByDate> {
        return await this.scheduleRepository.findSchedulesByDate(userId, dateTimePaginationDto)
    }

    async getSchedulesByParent(userId: string, parentId: string): Promise<Schedule[]> {
        return await this.scheduleRepository.findSchedulesByParentId(userId, parentId)
    }

    async getHolidaysByDate(userId: string, datePaginationDto: DateTimePaginationDto): Promise<GetHolidaysByDate> {
        return await this.scheduleRepository.findHolidaysByDate(userId, datePaginationDto)
    }

    async getSchedulesAndTodosByDate(userId: string, dateTimePaginationDto: DateTimePaginationDto): Promise<GetSchedulesAndTodosResponseByDate> {
        return await this.scheduleRepository.findSchedulesAndTodosByDate(userId, dateTimePaginationDto)
    }

    async getSchedulesBySearch(userId: string, content: string): Promise<GetSchedulesAndTodos> {
        return await this.scheduleRepository.findSchedulesBySearch(userId, content)
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

    async updateSchedulePartialAndCreateNewSchedule(userId : string, schedule: Schedule, updateSchedulePartialDto: UpdateSchedulePartialDto, queryRunner?: QueryRunner): Promise<Schedule> {
        const {id, ...scheduleData} = schedule
        return await this.scheduleRepository.updateSchedulePartial(userId, scheduleData, updateSchedulePartialDto, queryRunner)
    }

    async updateSchedulePartialAndSave(userId : string, schedule: Schedule, updateSchedulePartialDto: UpdateSchedulePartialDto, queryRunner?: QueryRunner): Promise<Schedule> {
        return await this.scheduleRepository.updateSchedulePartial(userId, schedule, updateSchedulePartialDto, queryRunner)
    }

    async updateRepeatScheduleFront(userId: string, scheduleId : string, updateRepeatFrontScheduleBySplitDto: UpdateRepeatFrontScheduleBySplitDto, queryRunner? : QueryRunner): Promise<void>{
        const existingSchedule = await this.scheduleRepository.findScheduleByUserAndScheduleId(userId, scheduleId);
        
        if (!existingSchedule) {
            throw new NotFoundException(`Schedule with id ${scheduleId} not found`);
        }

        const { nextRepeatStart, ...updateScheduleDto } = updateRepeatFrontScheduleBySplitDto
    
        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();

        try {
            // Start the transaction
            if (!queryRunner.isTransactionActive) {
                await queryRunner.startTransaction();
            }
            /* 기존 애를 변경 */
            await this.updateSchedulePartialAndSave(userId, existingSchedule, { repeatStart: nextRepeatStart }, queryRunner)

            /* 새로운 애를 만듦 */
            await this.createSchedule(userId, updateScheduleDto, queryRunner)

            await queryRunner.commitTransaction();
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
            if (shouldReleaseQueryRunner) {
                // Release the queryRunner if it was created in this function
                queryRunner.release();
            }
        }
    }

    async updateRepeatScheduleMiddle(userId: string, scheduleId : string, updateRepeatMiddleScheduleBySplitDto: UpdateRepeatMiddleScheduleBySplitDto, queryRunner? : QueryRunner): Promise<void>{
        const existingSchedule = await this.scheduleRepository.findScheduleByUserAndScheduleId(userId, scheduleId);
        
        if (!existingSchedule) {
            throw new NotFoundException(`Schedule with id ${scheduleId} not found`);
        }

        const { changedDate, nextRepeatStart, ...updateScheduleDto } = updateRepeatMiddleScheduleBySplitDto
        const preRepeatEnd = getPreRepeatEnd(changedDate, existingSchedule.repeatEnd)

        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();

        try {
            // Start the transaction
            if (!queryRunner.isTransactionActive) {
                await queryRunner.startTransaction();
            }
            /* 기존 애를 변경 */
            await this.updateSchedulePartialAndSave(userId, existingSchedule, { repeatEnd: preRepeatEnd }, queryRunner)

            /* 새로운 애를 만듦 */
            await this.createSchedule(userId, updateScheduleDto, queryRunner)
            await this.createNewNextRepeatSchedule(userId, existingSchedule, nextRepeatStart, queryRunner)

            await queryRunner.commitTransaction();
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
            if (shouldReleaseQueryRunner) {
                // Release the queryRunner if it was created in this function
                queryRunner.release();
            }
        }
    }

    async updateRepeatScheduleBack(userId: string, scheduleId : string, updateRepeatBackScheduleBySplitDto: UpdateRepeatBackScheduleBySplitDto, queryRunner? : QueryRunner): Promise<void>{
        const existingSchedule = await this.scheduleRepository.findScheduleByUserAndScheduleId(userId, scheduleId);
        
        if (!existingSchedule) {
            throw new NotFoundException(`Schedule with id ${scheduleId} not found`);
        }

        const { preRepeatEnd, ...updateScheduleDto } = updateRepeatBackScheduleBySplitDto
    
        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();

        try {
            // Start the transaction
            if (!queryRunner.isTransactionActive) {
                await queryRunner.startTransaction();
            }
            /* 기존 애를 변경 */
            await this.updateSchedulePartialAndSave(userId, existingSchedule, { repeatEnd: preRepeatEnd }, queryRunner)
            /* 새로운 애를 만듦 */
            await this.createSchedule(userId, updateScheduleDto, queryRunner)

            await queryRunner.commitTransaction();
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
            if (shouldReleaseQueryRunner) {
                // Release the queryRunner if it was created in this function
                queryRunner.release();
            }
        }
    }

    //schedule in scheduleIds 의 parentId 를 nextParentId 로 변경
    async updateSchedulesParentId(userId : string, scheduleIds :string[], nextParentId : string, queryRunner? : QueryRunner): Promise<void>{
        await this.scheduleRepository.updateSchedulesParentId(userId, scheduleIds, nextParentId, queryRunner);
    }

    //update schedule parent to null
    async updateScheduleParentToNull(userId : string, scheduleId : string, queryRunner? : QueryRunner): Promise<void>{
        await this.scheduleRepository.updateScheduleParentToNull(userId, scheduleId, queryRunner);
    }

    async deleteSchedule(userId: string, scheduleId: string): Promise<void> {
        return this.scheduleRepository.deleteSchedule(userId, scheduleId);
    }

    async deleteRepeatScheduleFront(userId: string, scheduleId : string, repeatScheduleSplitFrontDto: RepeatScheduleSplitFrontDto, queryRunner? : QueryRunner): Promise<void>{
        const existingSchedule = await this.scheduleRepository.findScheduleByUserAndScheduleId(userId, scheduleId);
        
        if (!existingSchedule) {
            throw new NotFoundException(`Schedule with id ${scheduleId} not found`);
        }

        const { repeatStart } = repeatScheduleSplitFrontDto
    
        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();

        try {
            // Start the transaction
            if (!queryRunner.isTransactionActive) {
                await queryRunner.startTransaction();
            }
            /* 기존 애를 변경 */
            await this.updateSchedulePartialAndSave(userId, existingSchedule, { repeatStart }, queryRunner)

            await queryRunner.commitTransaction();
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
            if (shouldReleaseQueryRunner) {
                // Release the queryRunner if it was created in this function
                queryRunner.release();
            }
        }
    }

    async deleteRepeatScheduleMiddle(userId: string, scheduleId : string, repeatScheduleSplitMiddleDto: RepeatScheduleSplitMiddleDto, queryRunner? : QueryRunner): Promise<void>{
        const existingSchedule = await this.scheduleRepository.findScheduleByUserAndScheduleId(userId, scheduleId);
        
        if (!existingSchedule) {
            throw new NotFoundException(`Schedule with id ${scheduleId} not found`);
        }

        const { removedDate, repeatStart } = repeatScheduleSplitMiddleDto
        const preRepeatEnd = getPreRepeatEnd(removedDate, existingSchedule.repeatEnd)
    
        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();

        try {
            // Start the transaction
            if (!queryRunner.isTransactionActive) {
                await queryRunner.startTransaction();
            }
            /* 기존 애를 변경 */
            await this.updateSchedulePartialAndSave(userId, existingSchedule, { repeatEnd: preRepeatEnd }, queryRunner)

            /* 새로운 애를 만듦 */
            await this.createNewNextRepeatSchedule(userId, existingSchedule, repeatStart, queryRunner)
            await queryRunner.commitTransaction();
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
            if (shouldReleaseQueryRunner) {
                // Release the queryRunner if it was created in this function
                queryRunner.release();
            }
        }
    }

    async deleteRepeatScheduleBack(userId: string, scheduleId : string, repeatTodoCompleteBySplitDto: RepeatScheduleSplitBackDto, queryRunner? : QueryRunner): Promise<void>{
        const existingSchedule = await this.scheduleRepository.findScheduleByUserAndScheduleId(userId, scheduleId);
        
        if (!existingSchedule) {
            throw new NotFoundException(`Schedule with id ${scheduleId} not found`);
        }

        const { repeatEnd } = repeatTodoCompleteBySplitDto
    
        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();

        try {
            // Start the transaction
            if (!queryRunner.isTransactionActive) {
                await queryRunner.startTransaction();
            }
            /* 기존 애를 변경 */
            await this.updateSchedulePartialAndSave(userId, existingSchedule, { repeatEnd }, queryRunner)

            await queryRunner.commitTransaction();
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
            if (shouldReleaseQueryRunner) {
                // Release the queryRunner if it was created in this function
                queryRunner.release();
            }
        }
    }
}
