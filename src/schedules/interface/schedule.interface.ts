import { BaseAlarm } from "src/alarms/interface/CreateAlarmToScheduleResponse.interface";
import { BaseCategory } from "src/categories/interface/category.interface";

export interface ScheduleResponse {
    id: string,
    content: string,
    memo: string,
    flag: boolean,
    endDate: string | Date,
    repeatOption : string,
    repeatValue : string,
    repeatEnd: string | Date,
    alarms: (BaseAlarm | string)[],
    category: BaseCategory,
    createdAt: string | Date,
    updatedAt: string | Date,
}