import { BaseAlarm } from "src/alarms/interface/CreateAlarmToScheduleResponse.interface";
import { Pagination } from "src/common/interface/pagination.interface";
import { BaseTag } from "src/tags/interface/tag.interface";
import { BaseSubTodo } from "./subtodo.interface";


export interface GetTodoResponse {
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
    subTodos: BaseSubTodo[],
    alarms: BaseAlarm[],
    tags: BaseTag[]
}

export interface GetTodoPaginationResponse{
    data : GetTodoResponse[],
    pagination : Pagination
}