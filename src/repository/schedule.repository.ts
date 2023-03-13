import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CategoriesService } from "src/categories/categories.service";
import { DatePaginationDto } from "src/common/dto/date-pagination.dto";
import { fromYYYYMMDDAddOneDayToDate, fromYYYYMMDDToDate } from "src/common/makeDate";
import { Alarm } from "src/entity/alarm.entity";
import { Category } from "src/entity/category.entity";
import { Schedule } from "src/entity/schedule.entity";
import { CreateScheduleDto } from "src/schedules/dto/create.schedule.dto";
import { Repository } from "typeorm";

export class ScheduleRepository {
    constructor(@InjectRepository(Schedule) private readonly repository: Repository<Schedule>,
        private readonly categoriesService: CategoriesService
    ) { }

    /* 스케줄 데이터 불러오기 */
    /* order : 1.repeat_start, 2.repeat_end, 3.created_at */
    async findSchedulesByDate(userId: string, datePaginationDto: DatePaginationDto) {
        const startDate = fromYYYYMMDDToDate(datePaginationDto.startDate)
        const endDate = fromYYYYMMDDAddOneDayToDate(datePaginationDto.endDate)

        const [todos, count] = await this.repository.createQueryBuilder('schedule')
                            .leftJoinAndSelect('schedule.category', 'category')
                            .leftJoinAndSelect('schedule.alarms', 'alarms')
                            .where('schedule.user = :userId', { userId })
                            .andWhere('(schedule.repeat_start >= :startDate AND schedule.repeat_start < :endDate) OR (schedule.repeat_end > :startDate AND schedule.repeat_end <= :endDate)')
                            .setParameters({ startDate, endDate })
                            .select(['schedule.id','schedule.content','schedule.memo','schedule.flag','schedule.repeatOption','schedule.repeat','schedule.repeatStart','schedule.repeatEnd','schedule.createdAt'])
                            .addSelect(['alarms.id', 'alarms.time'])
                            .addSelect(['category.id', 'category.content'])
                            .orderBy('schedule.repeat_start', 'ASC')
                            .addOrderBy('schedule.repeat_end', 'DESC')
                            .addOrderBy('schedule.created_at', 'ASC')
                            .getManyAndCount()

        return {
            data: todos,
            pagination: {
                totalItems: count,
                startDate,
                endDate
            },
        };
    }



    /* 스케줄 데이터 저장 */
    async createSchedule(userId: string, createScheduleDto: CreateScheduleDto) {
        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            /* 카테고리 저장 */
            const [category] = await this.categoriesService.createCategories(userId, { contents: [createScheduleDto.category] })

            /* 스케줄 저장 */
            const { alarms, ...scheduleData } = createScheduleDto;
            const savedSchedule = await queryRunner.manager.save(Schedule, {
                ...scheduleData,
                user: userId,
                category: {
                    id: category.id,
                    content: category.content
                }
            });

            /* 스케줄 알람 저장 */
            const newAlarms = alarms.map((time) => ({
                user: userId,
                schedule: savedSchedule.id,
                time: time,
            }));
            const savedAlarms = await queryRunner.manager.save(Alarm, newAlarms);
            const retAlarms = savedAlarms.map(({ id, time }) => ({ id, time }));

            await queryRunner.commitTransaction();

            return { ...savedSchedule, alarms: retAlarms };
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
