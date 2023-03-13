import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateAlarmsDto, UpdateAlarmDto } from "src/alarms/dto/create.alarm.dto";
import { Alarm } from "src/entity/alarm.entity";
import { Repository } from "typeorm";


export class AlarmRepository {
    constructor(@InjectRepository(Alarm) private readonly repository: Repository<Alarm>,
    ) { }


    async createAlarms(userId: string, createAlarmsDto: CreateAlarmsDto): Promise<Alarm[]> {
        const todoId = createAlarmsDto.todoId
        const scheduleId = createAlarmsDto.scheduleId

        if (!todoId) {
            const newAlarms = createAlarmsDto.times.map((time) => {
                return new Alarm({
                    user: userId,
                    schedule : scheduleId,
                    time
                })
            })
            return await this.repository.save(newAlarms)
        }else{
            const newAlarms = createAlarmsDto.times.map((time) => {
                return new Alarm({
                    user: userId,
                    todo: todoId,
                    time
                })
            })
            return await this.repository.save(newAlarms)
        }        
    }


    async updateAlarm(userId: string, alarmId: string, updateAlarmDto:UpdateAlarmDto ): Promise<Alarm> {
        const existingAlarm = await this.repository.findOne({ where: { id: alarmId, user:{id:userId} } });

        if (!existingAlarm) {
            throw new HttpException(
                'Alarm not found',
                HttpStatus.NOT_FOUND,
            );
        }

        try {
            const updatedAlarm = new Alarm({
                ...existingAlarm,
                ...updateAlarmDto,
            });
            return this.repository.save(updatedAlarm);
        } catch (error) {
            throw new HttpException(
                {
                    message: 'SQL error',
                    error: error.sqlMessage,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


    async deleteAlarm(userId: string, alarmId: string): Promise<void> {
        await this.repository.delete({
            user: { id: userId },
            id: alarmId
        });
    }
}