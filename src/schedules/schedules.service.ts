import { Injectable } from '@nestjs/common';
import { ScheduleRepository } from 'src/repository/schedule.repository';
import { CreateScheduleDto } from './dto/create.schedule.dto';

@Injectable()
export class ScheduleService {
    constructor(private readonly scheduleRepository: ScheduleRepository) { }
    
    async createSchedule(userId: string, createScheduleDto: CreateScheduleDto){

        

        return await this.scheduleRepository.createSchedule(userId, createScheduleDto)
    }

}
