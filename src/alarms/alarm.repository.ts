import { ConflictException, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateAlarmByTimeDto, CreateAlarmsDto, UpdateAlarmDto } from "src/alarms/dto/create.alarm.dto";
import { BaseAlarm } from "src/alarms/interface/alarm.interface";
import { Alarm } from "src/entity/alarm.entity";
import { User } from "src/entity/user.entity";
import { QueryRunner, Repository } from "typeorm";

export class AlarmRepository {
    constructor(@InjectRepository(Alarm) private readonly repository: Repository<Alarm>,
    ) { }

    /* 알람 단일 생성 함수 */
    async createAlarm(userId: string, scheduleId: string, dto: CreateAlarmByTimeDto): Promise<Alarm> {
        const { time } = dto;
        const whereCondition = { user: { id: userId }, schedule: { id: scheduleId }, time };
        
        const existingAlarm = await this.repository.findOne({ where: whereCondition });
        if (existingAlarm) {
            throw new ConflictException(`Alarm with this already exists`);
        }

        const newAlarm = this.repository.create({ user: { id: userId }, schedule: { id: scheduleId }, time });
        const savedAlarm = await this.repository.save(newAlarm);

        return savedAlarm;
    }

    /* 알람 여러개를 한번에 추가 */
    async createAlarms(userId: string, createAlarmsDto: CreateAlarmsDto, queryRunner?: QueryRunner): Promise<Alarm[]> {
        const { todoId, scheduleId, times }  = createAlarmsDto
        if(times.length === 0) return []

        const alarmRepository = queryRunner ? queryRunner.manager.getRepository(Alarm) : this.repository;
        
        const taskId = todoId || scheduleId

        const newAlarms = times.map(time => {
            return alarmRepository.create({ user: { id: userId }, schedule: { id: taskId }, time});
        })

        const savedAlarms = await alarmRepository.save(newAlarms);
        return savedAlarms;
    }

    async updateAlarm(userId: string, alarmId: string, updateAlarmDto: UpdateAlarmDto): Promise<Alarm> {
        const existingAlarm = await this.repository.findOne({ where: { id: alarmId, user: { id: userId } } });

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

    // update Alarms where by ScheduleId, if alarms more than 0, delete all alarms and create new alarms
    async updateAlarms(userId: string, updateAlarmsDto: CreateAlarmsDto, queryRunner?: QueryRunner): Promise<Alarm[]> {
        const { todoId, scheduleId, times } = updateAlarmsDto;
        const taskId = todoId || scheduleId;
        const alarmRepository = queryRunner ? queryRunner.manager.getRepository(Alarm) : this.repository;

        const existingAlarms = await alarmRepository.find({ where: { schedule: { id: taskId }, user: { id: userId } } });
        if (existingAlarms.length > 0) {
            await alarmRepository.delete({ schedule: { id: taskId }, user: { id: userId } });
        }

        if(times.length === 0) return []
        const newAlarms = times.map(time => {
            return alarmRepository.create({ user: { id: userId }, schedule: { id: taskId }, time});
        }
        )
        const savedAlarms = await alarmRepository.save(newAlarms);
        return savedAlarms;
    }
    
    async deleteAlarm(userId: string, alarmId: string): Promise<void> {
        await this.repository.delete({
            user: { id: userId },
            id: alarmId
        });
    }
}