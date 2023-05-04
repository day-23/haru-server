// // import { BaseAlarm } from "src/alarms/interface/CreateAlarmToScheduleResponse.interface";
// import { BaseCategory, BaseCategoryForScheduleResponse } from "src/categories/interface/category.interface";

import { BaseAlarm } from "src/alarms/interface/alarm.interface";
import { BaseCategory } from "src/categories/interface/category.interface";
import { Holiday } from "src/entity/holiday.entity";
import { TodoResponse } from "src/todos/interface/todo.return.interface";

/* 투두와 공통 요소 */
export interface BaseSchedule {
    id: string,
    content: string,
    memo: string,
    isAllDay: boolean,
    repeatEnd: Date,
    repeatOption: string,
    repeatValue: string,
    alarms: BaseAlarm[],
    createdAt: Date,
    updatedAt: Date,
}

export interface ScheduleResponse extends BaseSchedule {
    repeatStart: Date,
    category: BaseCategory,
}

export interface GetSchedulesAndTodos {
    schedules: ScheduleResponse[],
    todos: TodoResponse[],
}

export interface GetSchedulesAndTodosResponseByDate {
    data:{
        schedules: ScheduleResponse[],
        todos: TodoResponse[],
    }
    pagination: {
        totalItems: number,
        startDate: Date,
        endDate: Date
    },
}

export interface GetSchedulesResponseByDate {
    data: ScheduleResponse[],
    pagination: {
        totalItems: number,
        startDate: Date,
        endDate: Date
    },
}

export interface GetHolidaysByDate {
    data: Holiday[],
    pagination: {
        totalItems: number,
        startDate: Date,
        endDate: Date
    },
}