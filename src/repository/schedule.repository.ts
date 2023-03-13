import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CategoriesService } from "src/categories/categories.service";
import { Alarm } from "src/entity/alarm.entity";
import { Category } from "src/entity/category.entity";
import { Schedule } from "src/entity/schedule.entity";
import { CreateScheduleDto } from "src/schedules/dto/create.schedule.dto";
import { Repository } from "typeorm";

export class ScheduleRepository {
    constructor(@InjectRepository(Schedule) private readonly repository: Repository<Schedule>,
            private readonly categoriesService:CategoriesService
    ) { }

    /* 스케줄 데이터 저장 */
    async createSchedule(userId: string, createScheduleDto: CreateScheduleDto){
        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            /* 카테고리 저장 */
            const [category] = await this.categoriesService.createCategories(userId, { contents : [createScheduleDto.category]})
        
            /* 스케줄 저장 */
            const savedSchedule = await queryRunner.manager.save(Schedule, {
                ...createScheduleDto,
                user: userId,
                category : {
                    id : category.id,
                    content : category.content
                }
            });

            /* 스케줄 알람 저장 */
            const newAlarms = createScheduleDto.alarms.map((alarm) => ({
                user: userId,
                schedule: savedSchedule.id,
                time: alarm,
            }));
            const savedAlarms = await queryRunner.manager.save(Alarm, newAlarms);
            const retAlarms = savedAlarms.map(({ id, time }) => ({ id, time }));

            await queryRunner.commitTransaction();

            return {...savedSchedule, alarms: retAlarms};
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
