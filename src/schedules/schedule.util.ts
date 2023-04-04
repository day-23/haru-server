import { BaseAlarm } from "src/alarms/interface/alarm.interface";
import { BaseCategory } from "src/categories/interface/category.interface";
import { Alarm } from "src/entity/alarm.entity";
import { Category } from "src/entity/category.entity";
import { Schedule } from "src/entity/schedule.entity";
import { TodoResponse } from "src/todos/interface/todo.return.interface";
import { parseTodoResponse } from "src/todos/todo.util";
import { ScheduleResponse } from "./interface/schedule.interface";


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