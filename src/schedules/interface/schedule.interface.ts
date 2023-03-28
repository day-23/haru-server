// // import { BaseAlarm } from "src/alarms/interface/CreateAlarmToScheduleResponse.interface";
// import { BaseCategory, BaseCategoryForScheduleResponse } from "src/categories/interface/category.interface";

import { BaseAlarm } from "src/alarms/interface/alarm.interface";
import { BaseCategory } from "src/categories/interface/category.interface";

export interface ScheduleResponse {
    id: string,
    content: string,
    memo: string,
    isAllDay: boolean,
    repeatStart : string | Date,
    repeatEnd: string | Date,
    repeatOption : string,
    repeatValue : string,
    category: BaseCategory,
    alarms: BaseAlarm[],
    createdAt: string | Date,
    updatedAt: string | Date,
}


// export interface GetSchedulesResponseByDate {
//     data: ScheduleResponse[],
//     pagination: {
//         totalItems : number,
//         startDate : string | Date,
//         endDate : string | Date
//     },
// }

// export interface GetSchedulesResponse {
//     data: ScheduleResponse[],
// }