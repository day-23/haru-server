import { Alarm } from "src/entity/alarm.entity";

export interface CreateAlarmToScheduleResponse extends Pick<Alarm, 'id' | 'schedule' | 'time'> {}

export interface BaseAlarm {
    id: string,
    time: string,
}