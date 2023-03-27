import { Alarm } from "src/entity/alarm.entity";
import { Schedule } from "src/entity/schedule.entity";
import { Todo } from "src/entity/todo.entity";

export interface CreateAlarmResponse{
    id: string,
    scheduleId : Schedule,
    time : Date
}

// export interface CreateAlarmToTodoResponse{
//     id: string,
//     todoId : string | Todo,
//     time : Date
// }


export interface BaseAlarm {
    id: string,
    time: Date,
}