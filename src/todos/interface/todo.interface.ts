import { BaseAlarm } from "src/alarms/interface/CreateAlarmToScheduleResponse.interface";
import { Pagination, PaginationByDate } from "src/common/interface/pagination.interface";
import { Alarm } from "src/entity/alarm.entity";
import { BaseTag } from "src/tags/interface/tag.interface";

export interface TodoResponse {
    id: string,
    content: string,
    memo: string,
    todayTodo: boolean,
    flag: boolean,
    isSelectedEndDateTime: boolean,
    endDate: string | Date,
    repeatOption : string,
    repeatValue : string,
    repeatEnd: string | Date,
    todoOrder: number,
    completed: boolean,
    createdAt: string | Date,
    updatedAt: string | Date,
    subTodos: (GetSubTodoResponse | string)[],
    alarms: (BaseAlarm | string)[],
    tags: (BaseTag | string)[]
}

export interface GetTodosForMain{
    data : {
        flaggedTodos : TodoResponse[],
        taggedTodos: TodoResponse[],
        untaggedTodos : TodoResponse[],
        completedTodos : TodoResponse[],
    }
}

export interface GetTodosResponse {
    data: TodoResponse[],
}

export interface GetTodosPaginationResponse {
    data: TodoResponse[],
    pagination: Pagination
}

export interface GetTodayTodosResponse {
    data: {
        todayTodos: TodoResponse[]
        endDatedTodos: TodoResponse[]
    },
}

export interface GetTodosResponseByTag {
    data: {
        todos: TodoResponse[]
        completedTodos: TodoResponse[]
    },
}

export interface GetTodosResponseByDate {
    data: TodoResponse[],
    pagination: PaginationByDate
}



export interface BaseSubTodo {
    id: string,
    content: string,
    subTodoOrder: number,
}

export interface GetSubTodoResponse extends BaseSubTodo {
    completed : boolean
}