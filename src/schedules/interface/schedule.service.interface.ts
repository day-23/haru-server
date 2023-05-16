import { QueryRunner } from "typeorm"
import { CreateScheduleDto, UpdateSchedulePartialDto } from "../dto/create.schedule.dto"
import { GetHolidaysByDate, GetSchedulesAndTodos, GetSchedulesAndTodosResponseByDate, GetSchedulesResponseAndHolidaysByDate, GetSchedulesResponseByDate, ScheduleResponse } from "./schedule.interface"
import { DateTimePaginationDto } from "src/common/dto/date-pagination.dto"
import { RepeatScheduleSplitBackDto, RepeatScheduleSplitFrontDto, RepeatScheduleSplitMiddleDto, UpdateRepeatBackScheduleBySplitDto, UpdateRepeatFrontScheduleBySplitDto, UpdateRepeatMiddleScheduleBySplitDto } from "../dto/repeat.schedule.dto"
import { Schedule } from "src/entity/schedule.entity"

export interface ScheduleServiceInterface {
    createSchedule(userId: string, createScheduleDto: CreateScheduleDto, queryRunner?: QueryRunner): Promise<ScheduleResponse>
    createNewNextRepeatSchedule(userId: string, schedule: Schedule, nextRepeatStart: Date, queryRunner?: QueryRunner): Promise<ScheduleResponse>

    getScheduleByScheduleId(userId: string, scheduleId: string): Promise<Schedule>
    getSchedulesByDate(userId: string, dateTimePaginationDto: DateTimePaginationDto): Promise<GetSchedulesResponseAndHolidaysByDate>
    getSchedulesByParent(userId: string, parentId: string): Promise<Schedule[]>
    getSchedulesAndTodosByDate(userId: string, dateTimePaginationDto: DateTimePaginationDto): Promise<GetSchedulesAndTodosResponseByDate>
    getHolidaysByDate(userId: string, datePaginationDto: DateTimePaginationDto): Promise<GetHolidaysByDate>
    getSchedulesBySearch(userId: string, content: string): Promise<GetSchedulesAndTodos>

    updateSchedule(userId: string, scheduleId: string, createScheduleDto: CreateScheduleDto, queryRunner?: QueryRunner): Promise<ScheduleResponse>
    updateSchedulePartialAndSave(userId: string, schedule: Schedule, updateSchedulePartialDto: UpdateSchedulePartialDto, queryRunner?: QueryRunner): Promise<Schedule>
    updateSchedulePartialAndCreateNewSchedule(userId: string, schedule: Schedule, updateSchedulePartialDto: UpdateSchedulePartialDto, queryRunner?: QueryRunner): Promise<Schedule>

    updateRepeatScheduleFront(userId: string, scheduleId: string, updateRepeatFrontScheduleBySplitDto: UpdateRepeatFrontScheduleBySplitDto, queryRunner?: QueryRunner): Promise<void>
    updateRepeatScheduleMiddle(userId: string, scheduleId: string, updateRepeatMiddleScheduleBySplitDto: UpdateRepeatMiddleScheduleBySplitDto, queryRunner?: QueryRunner): Promise<void>
    updateRepeatScheduleBack(userId: string, scheduleId: string, updateRepeatBackScheduleBySplitDto: UpdateRepeatBackScheduleBySplitDto, queryRunner?: QueryRunner): Promise<void>

    updateSchedulesParentId(userId: string, scheduleIds: string[], nextParentId: string, queryRunner?: QueryRunner): Promise<void>
    updateScheduleParentToNull(userId: string, scheduleId: string, queryRunner?: QueryRunner): Promise<void>

    deleteRepeatScheduleFront(userId: string, scheduleId: string, repeatScheduleSplitFrontDto: RepeatScheduleSplitFrontDto, queryRunner?: QueryRunner): Promise<void>
    deleteRepeatScheduleMiddle(userId: string, scheduleId: string, repeatScheduleSplitMiddleDto: RepeatScheduleSplitMiddleDto, queryRunner?: QueryRunner): Promise<void>
    deleteRepeatScheduleBack(userId: string, scheduleId: string, repeatTodoCompleteBySplitDto: RepeatScheduleSplitBackDto, queryRunner?: QueryRunner): Promise<void>

    deleteSchedule(userId: string, scheduleId: string): Promise<void>
    deleteSchedule(userId: string, scheduleId: string, queryRunner?: QueryRunner) : Promise<void>
}