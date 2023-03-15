import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AlarmsService } from "src/alarms/alarms.service";
import { CategoriesService } from "src/categories/categories.service";
import { DatePaginationDto } from "src/common/dto/date-pagination.dto";
import { fromYYYYMMDDAddOneDayToDate, fromYYYYMMDDToDate } from "src/common/makeDate";
import { Alarm } from "src/entity/alarm.entity";
import { Category } from "src/entity/category.entity";
import { Schedule } from "src/entity/schedule.entity";
import { CreateScheduleDto, UpdateScheduleDto } from "src/schedules/dto/create.schedule.dto";
import { CreateAlarmByTimeDto } from "src/todos/dto/create.todo.dto";
import { Repository } from "typeorm";

export class ScheduleRepository {
    constructor(@InjectRepository(Schedule) private readonly repository: Repository<Schedule>,
        private readonly categoriesService: CategoriesService,
        private readonly alarmsService: AlarmsService,
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
            .select(['schedule.id', 'schedule.content', 'schedule.memo', 'schedule.flag', 'schedule.repeatOption', 'schedule.repeat', 'schedule.repeatStart', 'schedule.repeatEnd', 'schedule.createdAt'])
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

    /* 이미 생성된 스케줄에 데이터 추가 */
    /* 알람 추가 */
    async createAlarmToSchedule(userId: string, scheduleId: string, dto: CreateAlarmByTimeDto) {
        const result = await this.alarmsService.createAlarm(userId, null, scheduleId, dto)
        return { id: result.id, scheduleId: result.schedule, time: result.time }
    }

    /* 스케줄 내용 업데이트 */
    async updateSchedule(userId: string, scheduleId: string, dto: UpdateScheduleDto): Promise<Schedule> {
        dto.validateFields(); // validate category and alarms fields

        const existingSchedule = await this.repository.createQueryBuilder('schedule')
            .where('schedule.id = :scheduleId AND schedule.user_id = :userId', { scheduleId, userId})
            .getOne()

        if (!existingSchedule) {
            throw new HttpException(
                'Schedule not found',
                HttpStatus.NOT_FOUND,
            );
        }

        try {
            const updatedSchedule = this.repository.create({ ...existingSchedule, ...dto });
            const savedSchedule = await this.repository.save(updatedSchedule);

            const joinedSchedule = await this.repository.createQueryBuilder('schedule')
                .leftJoinAndSelect('schedule.alarms', 'alarms')
                .leftJoinAndSelect('schedule.category', 'category')
                .where('schedule.id = :scheduleId', { scheduleId: savedSchedule.id })
                .select(['schedule.id', 'schedule.content', 'schedule.memo', 'schedule.flag', 'schedule.repeatOption', 'schedule.repeat', 'schedule.repeatStart', 'schedule.repeatEnd', 'schedule.createdAt'])
                .addSelect(['alarms.id', 'alarms.time'])
                .addSelect(['category.id', 'category.content'])
                .getOne();

            // return savedSchedule
            return joinedSchedule
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


    /* 스케줄 삭제 */
    async deleteSchedule(userId: string, scheduleId: string): Promise<void> {
        const result = await this.repository.delete({
            user: { id: userId },
            id: scheduleId
        });

        if (result.affected === 0) {
            throw new HttpException(
                `No scheduleId with ID ${scheduleId} and user with ID ${userId} was found`,
                HttpStatus.NOT_FOUND,
            );
        }
    }


    /* 스케줄 검색 */
    async getSchedulesBySearch(userId: string, content: string) {
        return this.repository.createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.category', 'category')
            .leftJoinAndSelect('schedule.alarms', 'alarms')
            .where('schedule.user = :userId', { userId })
            .andWhere('(LOWER(schedule.content) LIKE LOWER(:searchValue) OR LOWER(category.content) LIKE LOWER(:searchValue))')
            .setParameters({ searchValue: `%${content}%` })
            .select(['schedule.id', 'schedule.content', 'schedule.memo', 'schedule.flag', 'schedule.repeatOption', 'schedule.repeat', 'schedule.repeatStart', 'schedule.repeatEnd', 'schedule.createdAt'])
            .addSelect(['alarms.id', 'alarms.time'])
            .addSelect(['category.id', 'category.content'])
            .orderBy('schedule.repeatStart', 'ASC')
            .addOrderBy('schedule.repeatEnd', 'DESC')
            .addOrderBy('schedule.createdAt', 'ASC')
            .take(50)
            .getMany()
    }
}
