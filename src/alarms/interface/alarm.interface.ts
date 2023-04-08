import { Schedule } from "src/entity/schedule.entity";

export interface CreateAlarmResponse{
    id: string,
    scheduleId : Schedule,
    time : Date
}

export interface BaseAlarm {
    id: string,
    time: Date,
}