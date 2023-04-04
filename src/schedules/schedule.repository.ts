import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DatePaginationDto, DateTimePaginationDto } from "src/common/dto/date-pagination.dto";
import { fromYYYYMMDDAddOneDayToDate, fromYYYYMMDDToDate } from "src/common/makeDate";
import { Holiday } from "src/entity/holiday.entity";
import { Schedule } from "src/entity/schedule.entity";
import { CreateScheduleWithoutAlarmsDto, UpdateScheduleDto, UpdateSchedulePartialDto } from "src/schedules/dto/create.schedule.dto";
import { GetSchedulesAndTodosResponseByDate, GetSchedulesResponseByDate, ScheduleResponse } from "src/schedules/interface/schedule.interface";

import { Between, QueryRunner, Repository } from "typeorm";
import { schedulesParseToSchedulesResponse, schedulesParseToTodosResponse } from "./schedule.util";

export class ScheduleRepository {
    constructor(
        @InjectRepository(Schedule) private readonly repository: Repository<Schedule>,
        @InjectRepository(Holiday) private readonly holidayRepository: Repository<Holiday>,
    ) { }

    async createOrUpdateSchedule(userId: string, scheduleId: string, createScheduleDto: CreateScheduleWithoutAlarmsDto, queryRunner?: QueryRunner) {
        const scheduleRepository = queryRunner ? queryRunner.manager.getRepository(Schedule) : this.repository;
        const { categoryId, parent } = createScheduleDto;

        let newSchedule = null;
        if (scheduleId) {
            newSchedule = scheduleRepository.create({ id: scheduleId, user: { id: userId }, category: { id: categoryId }, ...createScheduleDto, parent: { id: parent } });
        } else {
            newSchedule = scheduleRepository.create({ user: { id: userId }, category: { id: categoryId }, ...createScheduleDto, parent: { id: parent } });
        }
        const savedSchedule = await scheduleRepository.save(newSchedule);
        return savedSchedule;
    }

    // /* 스케줄 데이터 저장하고 스케줄 프로미스를 리턴한다  */
    async createSchedule(userId: string, createScheduleDto: CreateScheduleWithoutAlarmsDto, queryRunner?: QueryRunner): Promise<Schedule> {
        return this.createOrUpdateSchedule(userId, null, createScheduleDto, queryRunner);
    }

    /* 스케줄 내용 업데이트 */
    async updateSchedule(userId: string, scheduleId: string, createScheduleDto: CreateScheduleWithoutAlarmsDto, queryRunner?: QueryRunner): Promise<Schedule> {
        return this.createOrUpdateSchedule(userId, scheduleId, createScheduleDto, queryRunner);
    }

    /* 스케줄 내용 일부 업데이트 */
    async updateSchedulePartial(userId: string, schedule: Partial<Schedule>, updateSchedulePartialDto: UpdateSchedulePartialDto, queryRunner?: QueryRunner): Promise<Schedule> {
        const scheduleRepository = queryRunner ? queryRunner.manager.getRepository(Schedule) : this.repository;

        // get parent from schedule or updateSchedulePartialDto or null
        const parent = schedule?.parent?.id || updateSchedulePartialDto?.parent || null;

        const updatedSchedule = scheduleRepository.create({ ...schedule, ...updateSchedulePartialDto, parent: { id: parent } });
        const savedSchedule = await scheduleRepository.save(updatedSchedule);
        return savedSchedule;
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
    async deleteSchedule(userId: string, scheduleId: string): Promise<void> {
        const result = await this.repository.delete({
            user: { id: userId },
            id: scheduleId
        });

        if (result.affected === 0) {
            throw new HttpException(
                `No scheduleId with ID ${scheduleId} and user with ID ${userId} was found`,
                HttpStatus.NOT_FOUND,
            );
        }
    }

    /* 스케줄 데이터 불러오기 order : 1.repeat_start, 2.repeat_end, 3.created_at */
    async findSchedulesByDate(userId: string, datePaginationDto: DatePaginationDto): Promise<GetSchedulesResponseByDate> {
        const startDate = fromYYYYMMDDToDate(datePaginationDto.startDate)
        const endDate = fromYYYYMMDDAddOneDayToDate(datePaginationDto.endDate)

        //make query that schedule that is todo_id is null
        const [schedules, count] = await this.repository.createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.todo', 'todo')
            .leftJoinAndSelect('schedule.category', 'category')
            .leftJoinAndSelect('schedule.alarms', 'alarm')
            .where('schedule.user = :userId', { userId })
            .andWhere('schedule.todo_id IS NULL')
            .andWhere('((schedule.repeat_start >= :startDate AND schedule.repeat_start < :endDate) OR (schedule.repeat_end > :startDate AND schedule.repeat_end <= :endDate))')
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
            .andWhere('((schedule.repeat_start >= :startDate AND schedule.repeat_start < :endDate) OR (schedule.repeat_end > :startDate AND schedule.repeat_end <= :endDate))')
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
            console.log(data)

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
    async findSchedulesBySearch(userId: string, content: string): Promise<ScheduleResponse[]> {
        return await this.repository.createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.category', 'category')
            .leftJoinAndSelect('schedule.alarms', 'alarm')
            .where('schedule.user = :userId', { userId })
            .andWhere('(LOWER(schedule.content) LIKE LOWER(:searchValue) OR LOWER(category.content) LIKE LOWER(:searchValue))')
            .setParameters({ searchValue: `%${content}%` })
            .orderBy('schedule.repeatStart', 'ASC')
            .addOrderBy('schedule.repeatEnd', 'DESC')
            .addOrderBy('schedule.createdAt', 'ASC')
            .take(50)
            .getMany()
    }

    async findHolidaysByDate(userId: string, datePaginationDto: DatePaginationDto) {
        const { startDate, endDate } = datePaginationDto;
        const holidays = await this.holidayRepository.find({ where: { date: Between(startDate, endDate) } })

        return {
            data: holidays,
            pagination: {
                totalItems: holidays.length,
                startDate,
                endDate
            },
        };
    }
}