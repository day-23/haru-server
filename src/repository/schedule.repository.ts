import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AlarmsService } from "src/alarms/alarms.service";
import { CategoriesService } from "src/categories/categories.service";
import { Schedule } from "src/entity/schedule.entity";
import { CreateScheduleDto, CreateScheduleWithoutAlarmsDto, UpdateScheduleDto } from "src/schedules/dto/create.schedule.dto";
import { ScheduleResponse } from "src/schedules/interface/schedule.interface";
import { QueryRunner, Repository } from "typeorm";

export class ScheduleRepository {
    constructor(
        @InjectRepository(Schedule) private readonly repository: Repository<Schedule>,
    ) { }

    private scheduleProperties = ['schedule.id', 'schedule.content', 'schedule.memo', 'schedule.isAllDay', 'schedule.repeatStart', 'schedule.repeatEnd', 'schedule.repeatOption', 'schedule.repeatValue', 'schedule.createdAt', 'schedule.updatedAt']
    private alarmProperties = ['alarm.id', 'alarm.time']
    private categoryProperties = ['category.id', 'category.content', 'category.color', 'category.isSelected']
    // private scheduleRepeatProperties = ['schedulerepeat.id', 'schedulerepeat.repeatOption', 'schedulerepeat.repeatValue']

    // /* 스케줄 데이터 저장하고 스케줄 프로미스를 리턴한다  */
    async createSchedule(userId: string, createScheduleDto: CreateScheduleWithoutAlarmsDto, queryRunner: QueryRunner): Promise<Schedule> {
        const scheduleRepository = queryRunner ? queryRunner.manager.getRepository(Schedule) : this.repository;
        const { categoryId } = createScheduleDto

        const savedSchedule = await scheduleRepository.save({ ...createScheduleDto, user: { id: userId }, category: { id: categoryId } })
        return savedSchedule
    }

    /* 스케줄 내용 업데이트 */
    async updateSchedule(userId: string, scheduleId: string, createScheduleDto: CreateScheduleWithoutAlarmsDto, queryRunner: QueryRunner): Promise<Schedule> {
        const scheduleRepository = queryRunner ? queryRunner.manager.getRepository(Schedule) : this.repository;
        const { categoryId } = createScheduleDto

        const savedSchedule = await scheduleRepository.save({ ...createScheduleDto, user: { id: userId }, category: { id: categoryId }, id: scheduleId })
        return savedSchedule
    }

    async findScheduleByUserAndScheduleId(userId: string, scheduleId: string): Promise<Schedule> {
        return await this.repository.createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.alarms', 'alarm')
            .leftJoinAndSelect('schedule.category', 'category')
            .where('schedule.id = :scheduleId', { scheduleId })
            .andWhere('schedule.user = :userId', { userId })
            .select(this.scheduleProperties)
            .addSelect(this.alarmProperties)
            .addSelect(this.categoryProperties)
            .getOne()
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


    //         const joinedSchedule = await this.repository.createQueryBuilder('schedule')
    //             .leftJoinAndSelect('schedule.alarms', 'alarms')
    //             .leftJoinAndSelect('schedule.category', 'category')
    //             .where('schedule.id = :scheduleId', { scheduleId: savedSchedule.id })
    //             .select(['schedule.id', 'schedule.content', 'schedule.memo', 'schedule.flag', 'schedule.repeatOption', 'schedule.timeOption', 'schedule.repeatWeek', 'schedule.repeatMonth', 'schedule.repeatStart', 'schedule.repeatEnd', 'schedule.createdAt', 'schedule.updatedAt'])
    //             .addSelect(['alarms.id', 'alarms.time'])
    //             .addSelect(['category.id', 'category.content', 'category.color'])
    //             .getOne();

    //         // return savedSchedule
    //         return joinedSchedule
    //     } catch (error) {
    //         throw new HttpException(
    //             {
    //                 message: 'SQL error',
    //                 error: error.sqlMessage,
    //             },
    //             HttpStatus.INTERNAL_SERVER_ERROR,
    //         );
    //     }
    // }





    
}



    // /* 스케줄 데이터 불러오기 */
    // /* order : 1.repeat_start, 2.repeat_end, 3.created_at */
    // async findSchedulesByDate(userId: string, datePaginationDto: DatePaginationDto) : Promise<GetSchedulesResponseByDate> {
    //     const startDate = fromYYYYMMDDToDate(datePaginationDto.startDate)
    //     const endDate = fromYYYYMMDDAddOneDayToDate(datePaginationDto.endDate)

    //     const [schedules, count] = await this.repository.createQueryBuilder('schedule')
    //         .leftJoinAndSelect('schedule.category', 'category')
    //         .leftJoinAndSelect('schedule.alarms', 'alarm')
    //         .leftJoinAndSelect('schedule.scheduleRepeat', 'schedulerepeat')
    //         .where('schedule.user = :userId', { userId })
    //         .andWhere('(schedule.repeat_start >= :startDate AND schedule.repeat_start < :endDate) OR (schedule.repeat_end > :startDate AND schedule.repeat_end <= :endDate)')
    //         .setParameters({ startDate, endDate })
    //         .select(this.scheduleProperties)
    //         .addSelect(this.alarmProperties)
    //         .addSelect(this.categoryProperties)
    //         .addSelect(this.scheduleRepeatProperties)
    //         .orderBy('schedule.repeat_start', 'ASC')
    //         .addOrderBy('schedule.repeat_end', 'DESC')
    //         .addOrderBy('schedule.created_at', 'ASC')
    //         .getManyAndCount()

    //     return {
    //         data: parseRepeatFromSchedule(schedules),
    //         pagination: {
    //             totalItems: count,
    //             startDate,
    //             endDate
    //         },
    //     };
    // }



    // /* 스케줄 검색 */
    // async findSchedulesBySearch(userId: string, content: string) : Promise<GetSchedulesResponse>{
    //     const schedules = await this.repository.createQueryBuilder('schedule')
    //         .leftJoinAndSelect('schedule.category', 'category')
    //         .leftJoinAndSelect('schedule.alarms', 'alarm')
    //         .leftJoinAndSelect('schedule.scheduleRepeat', 'schedulerepeat')
    //         .where('schedule.user = :userId', { userId })
    //         .andWhere('(LOWER(schedule.content) LIKE LOWER(:searchValue) OR LOWER(category.content) LIKE LOWER(:searchValue))')
    //         .setParameters({ searchValue: `%${content}%` })
    //         .select(this.scheduleProperties)
    //         .addSelect(this.alarmProperties)
    //         .addSelect(this.categoryProperties)
    //         .addSelect(this.scheduleRepeatProperties)
    //         .orderBy('schedule.repeatStart', 'ASC')
    //         .addOrderBy('schedule.repeatEnd', 'DESC')
    //         .addOrderBy('schedule.createdAt', 'ASC')
    //         .take(50)
    //         .getMany()

    //     return {
    //         data : parseRepeatFromSchedule(schedules)
    //     }
    // }


    // /* 이미 생성된 스케줄에 데이터 추가 */
    // /* 알람 추가 */
    // async createAlarmToSchedule(userId: string, scheduleId: string, dto: CreateAlarmByTimeDto): Promise<CreateAlarmToScheduleResponse> {
    //     const result = await this.alarmsService.createAlarm(userId, null, scheduleId, dto)
    //     return { id: result.id, scheduleId: result.schedule, time: result.time }
    // }


   
    