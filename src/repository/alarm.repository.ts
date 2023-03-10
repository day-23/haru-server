import { InjectRepository } from "@nestjs/typeorm";
import { CreateAlarmsDto } from "src/alarms/dto/create.alarm.dto";
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
}