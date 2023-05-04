import { QueryRunner } from "typeorm";
import { CreateScheduleWithoutAlarmsDto, UpdateSchedulePartialDto } from "../dto/create.schedule.dto";
import { Schedule } from "src/entity/schedule.entity";
import { GetHolidaysByDate, GetSchedulesAndTodos, GetSchedulesAndTodosResponseByDate, GetSchedulesResponseByDate, ScheduleResponse } from "./schedule.interface";
import { DatePaginationDto, DateTimePaginationDto } from "src/common/dto/date-pagination.dto";


export interface ScheduleRepositoryInterface {
    createSchedule(userId: string, createScheduleDto: CreateScheduleWithoutAlarmsDto, queryRunner?: QueryRunner): Promise<Schedule>
    createOrUpdateSchedule(userId: string, scheduleId: string, createScheduleDto: CreateScheduleWithoutAlarmsDto, queryRunner?: QueryRunner): Promise<Schedule>

    findSchedulesByParentId(userId: string, parent: string): Promise<Schedule[]>
    findScheduleByUserAndScheduleId(userId: string, scheduleId: string): Promise<Schedule>
    findSchedulesByDate(userId: string, dateTimePaginationDto: DateTimePaginationDto): Promise<GetSchedulesResponseByDate>
    findSchedulesAndTodosByDate(userId: string, dateTimePaginationDto: DateTimePaginationDto): Promise<GetSchedulesAndTodosResponseByDate>
    findSchedulesBySearch(userId: string, content: string): Promise<GetSchedulesAndTodos>
    findHolidaysByDate(userId: string, datePaginationDto: DatePaginationDto): Promise<GetHolidaysByDate>

    updateSchedule(userId: string, scheduleId: string, createScheduleDto: CreateScheduleWithoutAlarmsDto, queryRunner?: QueryRunner): Promise<Schedule>
    updateSchedulePartial(userId: string, schedule: Partial<Schedule>, updateSchedulePartialDto: UpdateSchedulePartialDto, queryRunner?: QueryRunner): Promise<Schedule>
    updateSchedulesParentId(userId: string, scheduleIds: string[], nextParentId: string, queryRunner?: QueryRunner): Promise<void>
    updateScheduleParentToNull(userId: string, scheduleId: string, queryRunner?: QueryRunner): Promise<void>

    deleteSchedule(userId: string, scheduleId: string, queryRunner?: QueryRunner): Promise<void>
}