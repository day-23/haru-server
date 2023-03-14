import { Injectable } from '@nestjs/common';
import { Alarm } from 'src/entity/alarm.entity';
import { AlarmRepository } from 'src/repository/alarm.repository';
import { CreateAlarmByTimeDto } from 'src/todos/dto/create.todo.dto';
import { CreateAlarmsDto, UpdateAlarmDto } from './dto/create.alarm.dto';

@Injectable()
export class AlarmsService {
    constructor(private readonly alarmRepository: AlarmRepository) { }

    async createAlarm(userId: string, todoId: string, scheduleId: string, dto: CreateAlarmByTimeDto){
        return await this.alarmRepository.createAlarm(userId, todoId, scheduleId, dto)
    }


    async createAlarms(userId:string, createAlarmsDto:CreateAlarmsDto):Promise<Alarm[]>{
        return await this.alarmRepository.createAlarms(userId, createAlarmsDto)
    }

    async updateAlarm(userId: string, alarmId: string, updateAlarmDto: UpdateAlarmDto): Promise<Alarm> {
        return this.alarmRepository.updateAlarm(userId, alarmId, updateAlarmDto);
    }

    async deleteAlarm(userId: string, alarmId: string): Promise<void> {
        return await this.alarmRepository.deleteAlarm(userId, alarmId);
    }

}
