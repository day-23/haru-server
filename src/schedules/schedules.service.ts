import { Injectable } from '@nestjs/common';
import { DatePaginationDto } from 'src/common/dto/date-pagination.dto';
import { ScheduleRepository } from 'src/repository/schedule.repository';
import { CreateAlarmByTimeDto } from 'src/todos/dto/create.todo.dto';
import { CreateScheduleDto } from './dto/create.schedule.dto';

@Injectable()
export class ScheduleService {
    constructor(private readonly scheduleRepository: ScheduleRepository) { }
    
    async createSchedule(userId: string, createScheduleDto: CreateScheduleDto){
        return await this.scheduleRepository.createSchedule(userId, createScheduleDto)
    }

    async getSchedulesByDate(userId : string, datePaginationDto: DatePaginationDto){
        return await this.scheduleRepository.findSchedulesByDate(userId, datePaginationDto)
    }

    async createAlarmToSchedule(userId: string, scheduleId: string, dto: CreateAlarmByTimeDto) {
        return this.scheduleRepository.createAlarmToSchedule(userId, scheduleId, dto)
    }

    async getSchedulesBySearch(userId:string, content:string){
        return await this.scheduleRepository.getSchedulesBySearch(userId, content)
    }
}
