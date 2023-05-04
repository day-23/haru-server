import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DatePaginationDto, DateTimePaginationDto } from "src/common/dto/date-pagination.dto";
import { Holiday } from "src/entity/holiday.entity";
import { Schedule } from "src/entity/schedule.entity";
import { CreateScheduleWithoutAlarmsDto, UpdateSchedulePartialDto } from "src/schedules/dto/create.schedule.dto";
import { GetHolidaysByDate, GetSchedulesAndTodos, GetSchedulesAndTodosResponseByDate, GetSchedulesResponseByDate, ScheduleResponse } from "src/schedules/interface/schedule.interface";
import { Between, In, QueryRunner, Repository } from "typeorm";
import { schedulesParseToSchedulesResponse, schedulesParseToTodosResponse } from "./schedule.util";
import { ScheduleRepositoryInterface } from "./interface/schedule.repository.interface";

export class ScheduleRepository implements ScheduleRepositoryInterface {
    constructor(
        @InjectRepository(Schedule) private readonly repository: Repository<Schedule>,
        @InjectRepository(Holiday) private readonly holidayRepository: Repository<Holiday>,
    ) { }

    // /* 스케줄 데이터 저장하고 스케줄 프로미스를 리턴한다  */
    async createSchedule(userId: string, createScheduleDto: CreateScheduleWithoutAlarmsDto, queryRunner?: QueryRunner): Promise<Schedule> {
        return this.createOrUpdateSchedule(userId, null, createScheduleDto, queryRunner);
    }

    async createOrUpdateSchedule(userId: string, scheduleId: string, createScheduleDto: CreateScheduleWithoutAlarmsDto, queryRunner?: QueryRunner): Promise<Schedule> {
        const scheduleRepository = queryRunner ? queryRunner.manager.getRepository(Schedule) : this.repository;
        const { categoryId, parent } = createScheduleDto;

        const scheduleData = {
            ...(scheduleId ? { id: scheduleId } : {}),
            user: { id: userId },
            category: { id: categoryId },
            ...createScheduleDto,
            parent: { id: parent },
        };

        return await scheduleRepository.save(scheduleData);
    }

    /* 스케줄 내용 업데이트 */
    async updateSchedule(userId: string, scheduleId: string, createScheduleDto: CreateScheduleWithoutAlarmsDto, queryRunner?: QueryRunner): Promise<Schedule> {
        return this.createOrUpdateSchedule(userId, scheduleId, createScheduleDto, queryRunner);
    }

    /* 스케줄 내용 일부 업데이트 */
    async updateSchedulePartial(userId: string, schedule: Partial<Schedule>, updateSchedulePartialDto: UpdateSchedulePartialDto, queryRunner?: QueryRunner): Promise<Schedule> {
        const scheduleRepository = queryRunner ? queryRunner.manager.getRepository(Schedule) : this.repository;

        // if transaction is started don't start transaction
        // Start transaction if not already started
        let transactionStarted = false;
        if (!queryRunner) {
            queryRunner = this.repository.manager.connection.createQueryRunner();
            await queryRunner.startTransaction();
            transactionStarted = true;
        }

        try {
            // Get parent from schedule or updateSchedulePartialDto or null
            const parent = schedule?.parent?.id || updateSchedulePartialDto?.parent || null;

            const updatedSchedule = scheduleRepository.create({
                ...schedule,
                ...updateSchedulePartialDto,
                parent: { id: parent },
            });
            let savedSchedule: Schedule = null;

            // updatedSchedule is not Todo and If repeatEnd is less than repeatStart delete schedule
            if (updatedSchedule.repeatEnd && updatedSchedule.repeatStart > updatedSchedule.repeatEnd) {
                this.deleteSchedule(userId, schedule.id, queryRunner);
            } else {
                savedSchedule = await scheduleRepository.save(updatedSchedule);
            }

            // Commit transaction if it was started in this function
            if (transactionStarted) {
                await queryRunner.commitTransaction();
            }

            return savedSchedule;
        } catch (error) {
            // Rollback transaction if it was started in this function
            if (transactionStarted) {
                await queryRunner.rollbackTransaction();
            }

            throw error;
        } finally {
            // Release query runner if it was started in this function
            if (transactionStarted) {
                await queryRunner.release();
            }
        }
    }

    async findSchedulesByParentId(userId: string, parent: string): Promise<Schedule[]> {
        return await this.repository.createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.todo', 'todo')
            .leftJoinAndSelect('schedule.parent', 'parent')
            .leftJoinAndSelect('schedule.category', 'category')
            .leftJoinAndSelect('schedule.alarms', 'alarm')
            .where('schedule.user = :userId', { userId })
            .andWhere('schedule.parent = :parent', { parent })
            .orderBy('schedule.repeat_start', 'ASC')
            .getMany()
    }

    async findScheduleByUserAndScheduleId(userId: string, scheduleId: string): Promise<Schedule> {
        return await this.repository.createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.alarms', 'alarm')
            .leftJoinAndSelect('schedule.category', 'category')
            .where('schedule.id = :scheduleId', { scheduleId })
            .andWhere('schedule.user = :userId', { userId })
            .getOne()
    }

    /* 스케줄 삭제 */
    async deleteSchedule(userId: string, scheduleId: string, queryRunner?: QueryRunner): Promise<void> {
        const scheduleRepository = queryRunner ? queryRunner.manager.getRepository(Schedule) : this.repository;

        // if transaction is started don't start transaction
        // Start transaction if not already started
        let transactionStarted = false;
        if (!queryRunner) {
            queryRunner = this.repository.manager.connection.createQueryRunner();
            await queryRunner.startTransaction();
            transactionStarted = true;
        }
        
        try {
            const result = await scheduleRepository.delete({
                user: { id: userId },
                id: scheduleId
            });
    
            if (result.affected === 0) {
                throw new HttpException(
                    `No scheduleId with ID ${scheduleId} and user with ID ${userId} was found`,
                    HttpStatus.NOT_FOUND,
                );
            }

            // Commit transaction if it was started in this function
            if (transactionStarted) {
                await queryRunner.commitTransaction();
            }
        } catch (error) {
            // Rollback transaction if it was started in this function
            if (transactionStarted) {
                await queryRunner.rollbackTransaction();
            }

            throw error;
        } finally {
            // Release query runner if it was started in this function
            if (transactionStarted) {
                await queryRunner.release();
            }
        }
    }

    /* 스케줄 데이터 불러오기 order : 1.repeat_start, 2.repeat_end, 3.created_at */
    async findSchedulesByDate(userId: string, dateTimePaginationDto: DateTimePaginationDto): Promise<GetSchedulesResponseByDate> {
        const { startDate, endDate } = dateTimePaginationDto

        //make query that schedule that is todo_id is null
        const [schedules, count] = await this.repository.createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.todo', 'todo')
            .leftJoinAndSelect('schedule.category', 'category')
            .leftJoinAndSelect('schedule.alarms', 'alarm')
            .where('schedule.user = :userId', { userId })
            .andWhere('schedule.todo_id IS NULL')
            .andWhere('((schedule.repeat_start >= :startDate AND schedule.repeat_start < :endDate) OR (schedule.repeat_end > :startDate AND schedule.repeat_end <= :endDate) OR (schedule.repeat_start <= :startDate AND schedule.repeat_end >= :endDate))')
            .setParameters({ startDate, endDate })
            .orderBy('schedule.repeat_start', 'ASC')
            .addOrderBy('schedule.repeat_end', 'DESC')
            .addOrderBy('schedule.created_at', 'ASC')
            .getManyAndCount()

        return {
            data: schedulesParseToSchedulesResponse(schedules),
            pagination: {
                totalItems: count,
                startDate,
                endDate
            },
        };
    }


    /* 스케줄 & 투두 데이터 불러오기 */
    async findSchedulesAndTodosByDate(userId: string, dateTimePaginationDto: DateTimePaginationDto): Promise<GetSchedulesAndTodosResponseByDate> {
        const { startDate, endDate } = dateTimePaginationDto

        //make query that schedule that is todo_id is null
        const [datas, count] = await this.repository.createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.category', 'category')
            .leftJoinAndSelect('schedule.alarms', 'alarm')
            .leftJoinAndSelect('schedule.todo', 'todo')
            .leftJoinAndSelect('todo.todoTags', 'todoTags')
            .leftJoinAndSelect('todoTags.tag', 'tag')
            .leftJoinAndSelect('todo.subTodos', 'subTodos')
            .where('schedule.user = :userId', { userId })
            .andWhere('((schedule.repeat_start >= :startDate AND schedule.repeat_start < :endDate) OR (schedule.repeat_end > :startDate AND schedule.repeat_end <= :endDate) OR (schedule.repeat_start <= :startDate AND schedule.repeat_end >= :endDate) OR (schedule.repeat_start <= :endDate AND schedule.repeat_end IS NULL))')
            .setParameters({ startDate, endDate })
            .orderBy('schedule.repeat_start', 'ASC')
            .addOrderBy('schedule.repeat_end', 'DESC')
            .addOrderBy('schedule.created_at', 'ASC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .getManyAndCount()

        const todos = []
        const schedules = []

        // if todo of data is null, push data to schedules else to todos
        datas.forEach(data => {
            if (data.todo) {
                todos.push(data)
            } else {
                schedules.push(data)
            }
        })

        return {
            data: {
                schedules: schedulesParseToSchedulesResponse(schedules),
                todos: schedulesParseToTodosResponse(todos)
            },
            pagination: {
                totalItems: count,
                startDate,
                endDate
            },
        };
    }

    /* 스케줄 검색 */
    async findSchedulesBySearch(userId: string, content: string): Promise<GetSchedulesAndTodos> {
        //make query that schedule that is todo_id is null
        const [datas, count] = await this.repository.createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.category', 'category')
            .leftJoinAndSelect('schedule.alarms', 'alarm')
            .leftJoinAndSelect('schedule.todo', 'todo')
            .leftJoinAndSelect('todo.todoTags', 'todoTags')
            .leftJoinAndSelect('todoTags.tag', 'tag')
            .leftJoinAndSelect('todo.subTodos', 'subTodos')
            .where('schedule.user = :userId', { userId })
            .andWhere('(LOWER(schedule.content) LIKE LOWER(:searchValue) OR LOWER(category.content) LIKE LOWER(:searchValue) OR LOWER(tag.content) LIKE LOWER(:searchValue))')
            .setParameters({ searchValue: `%${content}%` })
            .orderBy('schedule.repeatStart', 'DESC')
            .addOrderBy('schedule.createdAt', 'DESC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .take(50)
            .getManyAndCount()
    
        const todos = []
        const schedules = []

        // if todo of data is null, push data to schedules else to todos
        datas.forEach(data => {
            if (data.todo) {
                todos.push(data)
            } else {
                schedules.push(data)
            }
        })

        return {
            schedules: schedulesParseToSchedulesResponse(schedules),
            todos: schedulesParseToTodosResponse(todos)
        }
    }

    async findHolidaysByDate(userId: string, datePaginationDto: DateTimePaginationDto): Promise<GetHolidaysByDate> {
        const { startDate, endDate } = datePaginationDto;
        //make query that schedule that is todo_id is null
        const [datas, count] = await this.holidayRepository.createQueryBuilder('holiday')
            .where('((holiday.repeat_start >= :startDate AND holiday.repeat_start < :endDate) OR (holiday.repeat_end > :startDate AND holiday.repeat_end <= :endDate) OR (holiday.repeat_start <= :startDate AND holiday.repeat_end >= :endDate) OR (holiday.repeat_start <= :endDate AND holiday.repeat_end IS NULL))')
            .setParameters({ startDate, endDate })
            .orderBy('holiday.repeat_start', 'ASC')
            .getManyAndCount()

        return {
            data: datas,
            pagination: {
                totalItems: count,
                startDate,
                endDate
            },
        };
    }

    async updateSchedulesParentId(userId: string, scheduleIds: string[], nextParentId: string, queryRunner?: QueryRunner): Promise<void> {
        const scheduleRepository = queryRunner ? queryRunner.manager.getRepository(Schedule) : this.repository;
        const options = { id: In(scheduleIds), user: { id: userId } };
        const update = { parent: { id: nextParentId } };

        let transactionStarted = false;
        if (!queryRunner) {
            queryRunner = this.repository.manager.connection.createQueryRunner();
            await queryRunner.startTransaction();
            transactionStarted = true;
        }

        try {
            await scheduleRepository.update(options, update);

            // Commit transaction if it was started in this function
            if (transactionStarted) {
                await queryRunner.commitTransaction();
            }
        } catch (error) {
            // Rollback transaction if it was started in this function
            if (transactionStarted) {
                await queryRunner.rollbackTransaction();
            }
            throw error;
        } finally {
            // Release query runner if it was started in this function
            if (transactionStarted) {
                await queryRunner.release();
            }
        }
    }

    //schedule to parent to null
    async updateScheduleParentToNull(userId: string, scheduleId: string, queryRunner?: QueryRunner): Promise<void> {
        const scheduleRepository = queryRunner ? queryRunner.manager.getRepository(Schedule) : this.repository;
        const options = { id: scheduleId, user: { id: userId } };
        const update = { parent: null };

        let transactionStarted = false;
        if (!queryRunner) {
            queryRunner = this.repository.manager.connection.createQueryRunner();
            await queryRunner.startTransaction();
            transactionStarted = true;
        }

        try {
            await scheduleRepository.update(options, update);

            // Commit transaction if it was started in this function
            if (transactionStarted) {
                await queryRunner.commitTransaction();
            }
        } catch (error) {
            // Rollback transaction if it was started in this function
            if (transactionStarted) {
                await queryRunner.rollbackTransaction();
            }
            throw error;
        } finally {
            // Release query runner if it was started in this function
            if (transactionStarted) {
                await queryRunner.release();
            }
        }
    }
}