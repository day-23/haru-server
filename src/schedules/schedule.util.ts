import { BaseAlarm } from "src/alarms/interface/alarm.interface";
import { BaseCategory } from "src/categories/interface/category.interface";
import { Alarm } from "src/entity/alarm.entity";
import { Category } from "src/entity/category.entity";
import { Schedule } from "src/entity/schedule.entity";
import { TodoResponse } from "src/todos/interface/todo.return.interface";
import { parseTodoResponse } from "src/todos/todo.util";
import { CreateScheduleDto } from "./dto/create.schedule.dto";
import { ScheduleResponse } from "./interface/schedule.interface";
import { getMinusOneDay } from "src/common/makeDate";


export function parseScheduleResponse(newSchedule: Schedule, category: Category, alarms: Alarm[]): ScheduleResponse {
    const baseAlarms: BaseAlarm[] = [];
    alarms.forEach(({ id, time }) => {
        baseAlarms.push({ id, time })
    })

    const response: ScheduleResponse = {
        id: newSchedule.id,
        content: newSchedule.content,
        memo: newSchedule.memo,
        isAllDay: newSchedule.isAllDay,
        repeatStart: newSchedule.repeatStart,
        repeatEnd: newSchedule.repeatEnd,
        repeatOption: newSchedule.repeatOption,
        repeatValue: newSchedule.repeatValue,
        alarms: baseAlarms,
        category,
        createdAt: newSchedule.createdAt,
        updatedAt: newSchedule.updatedAt,
    };
    return response;
}


export function schedulesParseToSchedulesResponse(schedules: Schedule[]) : ScheduleResponse[] {
    const schedulesResponse: ScheduleResponse[] = [];
    schedules.forEach((schedule) => {
        const { category, alarms } = schedule;
        const scheduleResponse = parseScheduleResponse(schedule, category, alarms);
        schedulesResponse.push(scheduleResponse);
    })
    return schedulesResponse;
}


export function schedulesParseToTodosResponse(schedules: Schedule[]) : TodoResponse[]{
    const todoResponses : TodoResponse[] = schedules.map(schedule => {
        const { category, alarms, todo } = schedule;
        const scheduleResponse = parseScheduleResponse(schedule, category, alarms);
        return parseTodoResponse(scheduleResponse, todo, todo.todoTags.map(todoTag => todoTag.tag), todo.subTodos);
    })

    //todoResponse order by endDate
    todoResponses.sort((a, b) => {
        if (a.endDate > b.endDate) {
            return 1;
        } else if (a.endDate < b.endDate) {
            return -1;
        } else {
            return 0;
        }
    })
    return todoResponses;

}


export function existingScheduleToCreateScheduleDto(existingSchedule : Schedule) : CreateScheduleDto{
    const { id, user, ...schedule} = existingSchedule
    const createScheduleDto: CreateScheduleDto = {
        ...schedule,
        content: schedule.content,
        memo: schedule.memo,
        isAllDay: schedule.isAllDay,
        repeatOption: schedule.repeatOption,
        repeatValue: schedule.repeatValue,
        repeatStart: schedule.repeatStart,
        repeatEnd: schedule.repeatEnd,
        alarms: schedule.alarms.map(alarm => alarm.time),
        categoryId: schedule.category ? schedule.category.id : null,
        parent : schedule.parent ? schedule.parent.id : null
    }
    return createScheduleDto
}


export function getPreRepeatEnd(removedDate: Date, repeatEnd: Date) : Date {
    // Extracting the date part as a string
    const date_part = removedDate.toISOString().split('T')[0];
    // Extracting the time part as a string (including the 'Z' at the end)
    const time_part = repeatEnd.toISOString().split('T')[1];

    return getMinusOneDay(new Date(date_part + 'T' + time_part))
}