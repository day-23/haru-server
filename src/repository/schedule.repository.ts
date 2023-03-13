import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Alarm } from "src/entity/alarm.entity";
import { Schedule } from "src/entity/schedule.entity";
import { CreateScheduleDto } from "src/schedules/dto/create.schedule.dto";
import { Repository } from "typeorm";

export class ScheduleRepository {
    constructor(@InjectRepository(Schedule) private readonly repository: Repository<Schedule>,
    ) { }

    async createSchedule(userId: string, createScheduleDto: CreateScheduleDto){
        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            /* 스케줄 데이터 저장 */
            console.log(createScheduleDto)

            const savedSchedule = await queryRunner.manager.save(Schedule, {
                ...createScheduleDto,
                user: userId,
            });

            await queryRunner.commitTransaction();

            // return { ...savedSchedule, alarms: retAlarms };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new HttpException(
                {
                    message: 'SQL error',
                    error: error.sqlMessage,
                },
                HttpStatus.FORBIDDEN,
            );
        } finally {
            await queryRunner.release();
        }
    }
}
