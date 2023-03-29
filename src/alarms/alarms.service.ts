import { Injectable } from '@nestjs/common';
import { Alarm } from 'src/entity/alarm.entity';
import { AlarmRepository } from 'src/alarms/alarm.repository';
import { CreateAlarmByTimeDto, CreateAlarmsDto, UpdateAlarmDto } from './dto/create.alarm.dto';
import { BaseAlarm } from './interface/alarm.interface';

@Injectable()
export class AlarmsService {
    constructor(private readonly alarmRepository: AlarmRepository) { }

    async createAlarm(userId: string, scheduleId: string, dto: CreateAlarmByTimeDto): Promise<Alarm> {
        return await this.alarmRepository.createAlarm(userId, scheduleId, dto)
    }

    async createAlarms(userId: string, createAlarmsDto: CreateAlarmsDto): Promise<BaseAlarm[]> {
        const savedAlarms = await this.alarmRepository.createAlarms(userId, createAlarmsDto)

        return savedAlarms.map(alarm => {
            return { id: alarm.id, time: alarm.time }
        })
    }

    async updateAlarm(userId: string, alarmId: string, updateAlarmDto: UpdateAlarmDto): Promise<Alarm> {
        return this.alarmRepository.updateAlarm(userId, alarmId, updateAlarmDto);
    }

    async deleteAlarm(userId: string, alarmId: string): Promise<void> {
        return await this.alarmRepository.deleteAlarm(userId, alarmId);
    }

}
