// import { BaseAlarm } from "src/alarms/interface/CreateAlarmToScheduleResponse.interface";
import { Pagination, PaginationByDate } from "src/common/interface/pagination.interface";
import { BaseSchedule } from "src/schedules/interface/schedule.interface";
import { BaseTagForTodoResponse } from "src/tags/interface/tag.interface";

export interface BaseTodo extends BaseSchedule {
    todayTodo: boolean,
    flag: boolean,
    endDate: string | Date,
    todoOrder: number,
    completed: boolean,
    folded : boolean,
    subTodos: BaseSubTodo[],
    tags: BaseTagForTodoResponse[]
}

export interface TodoResponse extends BaseTodo { }

export interface GetTodosForMain {
    data: {
        flaggedTodos: TodoResponse[],
        taggedTodos: TodoResponse[],
        untaggedTodos: TodoResponse[],
        completedTodos: TodoResponse[],
    }
}

export interface GetAllTodosResponse {
    data: {
        flaggedTodos: TodoResponse[],
        taggedTodos: TodoResponse[],
        untaggedTodos: TodoResponse[],
        completedTodos: TodoResponse[],
        todayTodos: TodoResponse[]
        todayFlaggedTodos: TodoResponse[]
        endDatedTodos: TodoResponse[]
    }
}


export interface GetTodosPaginationResponse {
    data: TodoResponse[],
    pagination: Pagination
}

export interface GetTodayTodosResponse {
    data: {
        flaggedTodos: TodoResponse[]
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
    completed: boolean
}