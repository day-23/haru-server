import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginatedResponse } from 'src/common/decorators/paginated-response.decorator';
import { DatePaginationDto } from 'src/common/dto/date-pagination.dto';
// import { Schedule } from 'src/entity/schedule.entity';
import { CreateAlarmByTimeDto } from 'src/todos/dto/create.todo.dto';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/create.schedule.dto';
import { ScheduleResponse } from './interface/schedule.interface';
import { ScheduleService } from './schedules.service';

@Controller('schedule/:userId')
@ApiTags('Schedule API')
export class ScheduleController {
    constructor(private readonly scheduleService: ScheduleService) { }
    @Post()
    @ApiOperation({ summary: '스케줄 생성 API', description: '스케줄을 생성한다.' })
    async create(@Param('userId') userId: string, @Body() createScheduleDto: CreateScheduleDto) : Promise<ScheduleResponse>{
        return await this.scheduleService.createSchedule(userId, createScheduleDto)
    }

    @Patch(':scheduleId')
    @ApiOperation({ summary: '스케줄 일정 전체 내용 수정 API', description: '스케줄를 수정한다.' })
    async updateSchedule(@Param('userId') userId: string,
        @Param('scheduleId') scheduleId: string,
        @Body() schedule: CreateScheduleDto) : Promise<ScheduleResponse>{
        return this.scheduleService.updateSchedule(userId, scheduleId, schedule);
    }


    // @PaginatedResponse()
    // @Get('holidays/date')
    // @ApiOperation({ summary: '공휴일을 날짜 파라미터로 조회 API', description: '공휴일을를 조회한다.' })
    // @ApiCreatedResponse({
    //     description: '공휴일을 페이지네이션 방식으로 조회한다.'
    // })
    // @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    // @ApiQuery({ name: 'endDate', type: String, required: true, description: '마지막 날짜' })
    // @ApiQuery({ name: 'startDate', type: String, required: true, description: '시작 날짜' })
    // async getHolidaysByDate(@Param('userId') userId, @Query() datePaginationDto: DatePaginationDto) {
    //     return await this.scheduleService.getHolidaysByDate(userId, datePaginationDto);
    // }

    // @PaginatedResponse()
    // @Get('schedules/date')
    // @ApiOperation({ summary: '스케줄을 날짜 파라미터로 조회 API', description: '스케줄을를 조회한다.' })
    // @ApiCreatedResponse({
    //     description: '스케줄을 페이지네이션 방식으로 조회한다.'
    // })
    // @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    // @ApiQuery({ name: 'endDate', type: String, required: true, description: '마지막 날짜' })
    // @ApiQuery({ name: 'startDate', type: String, required: true, description: '시작 날짜' })
    // async getSchedulesByDate(@Param('userId') userId, @Query() datePaginationDto: DatePaginationDto) {
    //     return await this.scheduleService.getSchedulesByDate(userId, datePaginationDto);
    // }


    // @Get('search')
    // @ApiOperation({ summary: '일정 검색 API', description: '일정를 검색한다.' })
    // async searchSchedules(
    //     @Param('userId') userId : string,
    //     @Query('content') content : string,
    // ){
    //     return this.scheduleService.getSchedulesBySearch(userId, content)
    // }


    // @Delete(':scheduleId')
    // @ApiOperation({ summary: '스케줄 삭제 API', description: '스케줄를 삭제한다.' })
    // @ApiCreatedResponse({
    //     description: '스케줄를 삭제한다.'
    // })
    // async deleteSchedule(@Param('userId') userId: string,
    //     @Param('scheduleId') scheduleId: string): Promise<void> {
    //     return this.scheduleService.deleteSchedule(userId, scheduleId);
    // }


}
