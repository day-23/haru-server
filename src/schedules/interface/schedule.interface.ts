// // import { BaseAlarm } from "src/alarms/interface/CreateAlarmToScheduleResponse.interface";
// import { BaseCategory, BaseCategoryForScheduleResponse } from "src/categories/interface/category.interface";

import { BaseAlarm } from "src/alarms/interface/alarm.interface";
import { BaseCategory } from "src/categories/interface/category.interface";
import { Holiday } from "src/entity/holiday.entity";
import { TodoResponse } from "src/todos/interface/todo.return.interface";

export interface BaseSchedule {
    id: string,
    content: string,
    memo: string,
    isAllDay: boolean,
    repeatEnd: string | Date,
    repeatOption: string,
    repeatValue: string,
    alarms: BaseAlarm[],
    createdAt: string | Date,
    updatedAt: string | Date,
}

export interface ScheduleResponse extends BaseSchedule {
    repeatStart: string | Date,
    category: BaseCategory,
}



export interface GetSchedulesAndTodosResponseByDate {
    data:{
        schedules: ScheduleResponse[],
        todos: TodoResponse[],
    }
    pagination: {
        totalItems: number,
        startDate: string | Date,
        endDate: string | Date
    },
}

export interface GetSchedulesResponseByDate {
    data: ScheduleResponse[],
    pagination: {
        totalItems: number,
        startDate: string | Date,
        endDate: string | Date
    },
}

export interface GetHolidaysByDate {
    data: Holiday[],
    pagination: {
        totalItems: number,
        startDate: string | Date,
        endDate: string | Date
    },
}