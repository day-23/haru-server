import { Injectable } from '@nestjs/common';
// import { CreateAlarmToScheduleResponse } from 'src/alarms/interface/CreateAlarmToScheduleResponse.interface';
// import { DatePaginationDto } from 'src/common/dto/date-pagination.dto';
// import { Schedule } from 'src/entity/schedule.entity';
import { ScheduleRepository } from 'src/repository/schedule.repository';
import { CreateAlarmByTimeDto } from 'src/todos/dto/create.todo.dto';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/create.schedule.dto';

@Injectable()
export class ScheduleService {
    constructor(private readonly scheduleRepository: ScheduleRepository) { }

    // async createSchedule(userId: string, createScheduleDto: CreateScheduleDto) {
    //     return await this.scheduleRepository.createSchedule(userId, createScheduleDto)
    // }

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
