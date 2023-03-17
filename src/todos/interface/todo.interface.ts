import { BaseAlarm } from "src/alarms/interface/CreateAlarmToScheduleResponse.interface";
import { Pagination, PaginationByDate } from "src/common/interface/pagination.interface";
import { Alarm } from "src/entity/alarm.entity";
import { BaseTag } from "src/tags/interface/tag.interface";
import { BaseSubTodo, GetSubTodoResponse } from "./subtodo.interface";


export interface CreateTodoResponse {
    id: string,
    content: string,
    memo: string,
    todayTodo: boolean,
    flag: boolean,
    repeatOption: string,
    repeatWeek: string,
    repeatMonth: string,
    endDate: string | Date,
    endDateTime: string | Date,
    repeatEnd: string | Date,
    todoOrder: number,
    createdAt: string | Date,
    subTodos: BaseSubTodo[] | string[],
    alarms: BaseAlarm[] | string[],
    tags: BaseTag[] | string[]
}


export interface GetTodoResponse {
    id: string,
    content: string,
    memo: string,
    todayTodo: boolean,
    flag: boolean,
    repeatOption: string,
    repeatWeek: string,
    repeatMonth: string,
    repeatYear: string,
    endDate: string | Date,
    endDateTime: string | Date,
    repeatEnd: string | Date,
    todoOrder: number,
    completed: boolean,
    createdAt: string | Date,
    updatedAt: string | Date,
    subTodos: (GetSubTodoResponse | string)[],
    alarms: (BaseAlarm | string)[],
    tags: (BaseTag | string)[]
}

export interface GetTodosPaginationResponse {
    data: GetTodoResponse[],
    pagination: Pagination
}


export interface GetTodosResponseByTag {
    data: GetTodoResponse[],
}

export interface GetTodosResponseByDate {
    data: GetTodoResponse[],
    pagination: PaginationByDate
}