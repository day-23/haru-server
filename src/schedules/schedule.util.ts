import { BaseAlarm } from "src/alarms/interface/alarm.interface";
import { BaseCategory } from "src/categories/interface/category.interface";
import { Alarm } from "src/entity/alarm.entity";
import { Category } from "src/entity/category.entity";
import { Schedule } from "src/entity/schedule.entity";
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
        timeOption: newSchedule.timeOption,
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
