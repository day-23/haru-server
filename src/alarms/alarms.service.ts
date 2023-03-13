import { Injectable } from '@nestjs/common';
import { Alarm } from 'src/entity/alarm.entity';
import { AlarmRepository } from 'src/repository/alarm.repository';
import { CreateAlarmsDto, UpdateAlarmDto } from './dto/create.alarm.dto';

@Injectable()
export class AlarmsService {
    constructor(private readonly alarmRepository: AlarmRepository) { }

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
