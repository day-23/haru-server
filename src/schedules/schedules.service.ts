import { Injectable } from '@nestjs/common';
import { AlarmRepository } from 'src/repository/alarm.repository';
// import { CreateAlarmToScheduleResponse } from 'src/alarms/interface/CreateAlarmToScheduleResponse.interface';
// import { DatePaginationDto } from 'src/common/dto/date-pagination.dto';
// import { Schedule } from 'src/entity/schedule.entity';
import { ScheduleRepository } from 'src/repository/schedule.repository';
import { CreateScheduleDto } from './dto/create.schedule.dto';

@Injectable()
export class ScheduleService {
    constructor(private readonly scheduleRepository: ScheduleRepository,
            private readonly alarmRepository: AlarmRepository
        ) { }

    async createSchedule(userId: string, createScheduleDto: CreateScheduleDto) {
        const {alarms, ...schedule} = createScheduleDto

        const newSchedule = await this.scheduleRepository.createSchedule(userId, schedule)
        const newAlarms = await this.alarmRepository.createAlarms(userId, { scheduleId:newSchedule.id , times:alarms})

        return await this.scheduleRepository.createSchedule(userId, schedule)
    }

    // async getHolidaysByDate(userId: string, datePaginationDto: DatePaginationDto) {
    //     return await this.scheduleRepository.findHolidaysByDate(userId, datePaginationDto)
    // }

    // async getSchedulesByDate(userId: string, datePaginationDto: DatePaginationDto) {
    //     return await this.scheduleRepository.findSchedulesByDate(userId, datePaginationDto)
    // }

    // async createAlarmToSchedule(userId: string, scheduleId: string, dto: CreateAlarmByTimeDto): Promise<CreateAlarmToScheduleResponse>  {
    //     return this.scheduleRepository.createAlarmToSchedule(userId, scheduleId, dto)
    // }

    // async getSchedulesBySearch(userId: string, content: string) {
    //     return await this.scheduleRepository.findSchedulesBySearch(userId, content)
    // }

    // async updateSchedule(userId: string, scheduleId: string, schedule: UpdateScheduleDto): Promise<Schedule> {
    //     return this.scheduleRepository.updateSchedule(userId, scheduleId, schedule);
    // }

    // async deleteSchedule(userId: string, scheduleId: string): Promise<void> {
    //     return this.scheduleRepository.deleteSchedule(userId, scheduleId);
    // }
}
