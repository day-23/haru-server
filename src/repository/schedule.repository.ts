import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AlarmsService } from "src/alarms/alarms.service";
import { CreateAlarmToScheduleResponse } from "src/alarms/interface/CreateAlarmToScheduleResponse.interface";
import { CategoriesService } from "src/categories/categories.service";
import { DatePaginationDto } from "src/common/dto/date-pagination.dto";
import { fromYYYYMMDDAddOneDayToDate, fromYYYYMMDDToDate } from "src/common/makeDate";
import { parseRepeatFromSchedule } from "src/common/utils/data-utils";
import { Alarm } from "src/entity/alarm.entity";
import { Category } from "src/entity/category.entity";
import { Holiday } from "src/entity/holiday.entity";
import { ScheduleRepeat } from "src/entity/schedule-repeat.entity";
import { Schedule } from "src/entity/schedule.entity";
import { CreateScheduleDto, UpdateScheduleDto } from "src/schedules/dto/create.schedule.dto";
import { GetSchedulesResponse, GetSchedulesResponseByDate, ScheduleResponse } from "src/schedules/interface/schedule.interface";
import { CreateAlarmByTimeDto } from "src/todos/dto/create.todo.dto";
import { Repository } from "typeorm";

export class ScheduleRepository {
    constructor(@InjectRepository(Schedule) private readonly repository: Repository<Schedule>,
        @InjectRepository(Holiday) private readonly holidayRepository: Repository<Holiday>,
        private readonly categoriesService: CategoriesService,
        private readonly alarmsService: AlarmsService,
    ) { }

    private scheduleProperties = ['schedule.id', 'schedule.content', 'schedule.memo', 'schedule.flag', 'schedule.timeOption', 'schedule.repeatStart', 'schedule.repeatEnd', 'schedule.createdAt']
    private alarmProperties = ['alarm.id', 'alarm.time']
    private categoryProperties = ['category.id', 'category.content', 'category.color', 'category.isSelected']
    private scheduleRepeatProperties = ['schedulerepeat.id', 'schedulerepeat.repeatOption', 'schedulerepeat.repeatValue']

    /* 스케줄 데이터 저장 */
    async createSchedule(userId: string, createScheduleDto: CreateScheduleDto): Promise<ScheduleResponse> {
        const { alarms, categoryId, ...scheduleData } = createScheduleDto;
        const savedCategory = await this.categoriesService.getCategoryById(userId, categoryId)

        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            /* 스케줄 저장 */
            const { user, deletedAt, ...savedSchedule } = await queryRunner.manager.save(Schedule, {
                ...scheduleData,
                user: userId,
                category: categoryId
            });

            /* 스케줄 알람 저장 */
            const newAlarms = alarms.map((time) => ({
                user: userId,
                schedule: savedSchedule.id,
                time: time,
            }));


            const promises: Promise<any>[] = [
                queryRunner.manager.save(Alarm, newAlarms),
            ];

            if (createScheduleDto.repeatOption) {
                const newScheduleRepeat = {
                    schedule: { id: savedSchedule.id },
                    repeatOption: createScheduleDto.repeatOption,
                    repeatValue: createScheduleDto.repeatValue
                };
                promises.push(queryRunner.manager.save(ScheduleRepeat, newScheduleRepeat))
            }
            const [savedAlarms, savedScheduleRepeat] = await Promise.all(promises);
            await queryRunner.commitTransaction();

            const retAlarms = savedAlarms.map(({ id, time }) => ({ id, time }));

            let repeatOption = null
            let repeatValue = null
            if (savedScheduleRepeat) {
                repeatOption = savedScheduleRepeat.repeatOption
                repeatValue = savedScheduleRepeat.repeatValue
            }

            const { id, content, color, isSelected } = savedCategory;
            const category = { id, content, color, isSelected };
            return { id: savedSchedule.id, ...savedSchedule, alarms: retAlarms, category, repeatOption, repeatValue };
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

    async findHolidaysByDate(userId: string, datePaginationDto: DatePaginationDto) {
        const startDate = fromYYYYMMDDToDate(datePaginationDto.startDate)
        const endDate = fromYYYYMMDDAddOneDayToDate(datePaginationDto.endDate)

        const [holidays, count] = await this.holidayRepository.createQueryBuilder('holiday')
            .andWhere('(holiday.date >= :startDate AND holiday.date < :endDate)')
            .setParameters({ startDate, endDate })
            .select(['holiday.date', 'holiday.name'])
            .getManyAndCount()

        return {
            data: holidays,
            pagination: {
                totalItems: count,
                startDate,
                endDate
            },
        };
    }


    /* 스케줄 데이터 불러오기 */
    /* order : 1.repeat_start, 2.repeat_end, 3.created_at */
    async findSchedulesByDate(userId: string, datePaginationDto: DatePaginationDto) : Promise<GetSchedulesResponseByDate> {
        const startDate = fromYYYYMMDDToDate(datePaginationDto.startDate)
        const endDate = fromYYYYMMDDAddOneDayToDate(datePaginationDto.endDate)

        const [schedules, count] = await this.repository.createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.category', 'category')
            .leftJoinAndSelect('schedule.alarms', 'alarm')
            .leftJoinAndSelect('schedule.scheduleRepeat', 'schedulerepeat')
            .where('schedule.user = :userId', { userId })
            .andWhere('(schedule.repeat_start >= :startDate AND schedule.repeat_start < :endDate) OR (schedule.repeat_end > :startDate AND schedule.repeat_end <= :endDate)')
            .setParameters({ startDate, endDate })
            .select(this.scheduleProperties)
            .addSelect(this.alarmProperties)
            .addSelect(this.categoryProperties)
            .addSelect(this.scheduleRepeatProperties)
            .orderBy('schedule.repeat_start', 'ASC')
            .addOrderBy('schedule.repeat_end', 'DESC')
            .addOrderBy('schedule.created_at', 'ASC')
            .getManyAndCount()

        return {
            data: parseRepeatFromSchedule(schedules),
            pagination: {
                totalItems: count,
                startDate,
                endDate
            },
        };
    }



    /* 스케줄 검색 */
    async findSchedulesBySearch(userId: string, content: string) : Promise<GetSchedulesResponse>{
        const schedules = await this.repository.createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.category', 'category')
            .leftJoinAndSelect('schedule.alarms', 'alarm')
            .leftJoinAndSelect('schedule.scheduleRepeat', 'schedulerepeat')
            .where('schedule.user = :userId', { userId })
            .andWhere('(LOWER(schedule.content) LIKE LOWER(:searchValue) OR LOWER(category.content) LIKE LOWER(:searchValue))')
            .setParameters({ searchValue: `%${content}%` })
            .select(this.scheduleProperties)
            .addSelect(this.alarmProperties)
            .addSelect(this.categoryProperties)
            .addSelect(this.scheduleRepeatProperties)
            .orderBy('schedule.repeatStart', 'ASC')
            .addOrderBy('schedule.repeatEnd', 'DESC')
            .addOrderBy('schedule.createdAt', 'ASC')
            .take(50)
            .getMany()

        return {
            data : parseRepeatFromSchedule(schedules)
        }
    }


    /* 이미 생성된 스케줄에 데이터 추가 */
    /* 알람 추가 */
    async createAlarmToSchedule(userId: string, scheduleId: string, dto: CreateAlarmByTimeDto): Promise<CreateAlarmToScheduleResponse> {
        const result = await this.alarmsService.createAlarm(userId, null, scheduleId, dto)
        return { id: result.id, scheduleId: result.schedule, time: result.time }
    }

    /* 스케줄 내용 업데이트 */
    async updateSchedule(userId: string, scheduleId: string, dto: UpdateScheduleDto): Promise<Schedule> {
        dto.validateFields(); // validate category and alarms fields

        const existingSchedule = await this.repository.createQueryBuilder('schedule')
            .where('schedule.id = :scheduleId AND schedule.user_id = :userId', { scheduleId, userId })
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
                .select(['schedule.id', 'schedule.content', 'schedule.memo', 'schedule.flag', 'schedule.repeatOption', 'schedule.timeOption', 'schedule.repeatWeek', 'schedule.repeatMonth', 'schedule.repeatStart', 'schedule.repeatEnd', 'schedule.createdAt', 'schedule.updatedAt'])
                .addSelect(['alarms.id', 'alarms.time'])
                .addSelect(['category.id', 'category.content', 'category.color'])
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
}
