import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginatedResponse } from 'src/common/decorators/paginated-response.decorator';
import { DatePaginationDto, DateTimePaginationDto } from 'src/common/dto/date-pagination.dto';
import { RepeatSplitBackDto, RepeatSplitFrontDto, RepeatSplitMiddleDto } from 'src/todos/dto/repeat.todo.dto';
import { CreateScheduleDto, UpdateScheduleBySplitDto } from './dto/create.schedule.dto';
import { UpdateRepeatBackScheduleBySplitDto, UpdateRepeatFrontScheduleBySplitDto, UpdateRepeatMiddleScheduleBySplitDto } from './dto/repeat.schedule.dto';
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

    @Patch(':scheduleId/split')
    @ApiOperation({ summary: '반복되는 스케줄 중 하나만 수정하여 split함', description: '스케줄를 수정한다.' })
    async updateScheduleBySplit(@Param('userId') userId: string,
        @Param('scheduleId') scheduleId: string, 
        @Body() updateScheduleBySplitDto: UpdateScheduleBySplitDto) : Promise<ScheduleResponse>{
        return this.scheduleService.updateScheduleBySplit(userId, scheduleId, updateScheduleBySplitDto);
    }

    @Delete(':scheduleId')
    @ApiOperation({ summary: '스케줄 삭제 API', description: '스케줄를 삭제한다.' })
    async deleteSchedule(@Param('userId') userId: string,
        @Param('scheduleId') scheduleId: string): Promise<void> {
        return this.scheduleService.deleteSchedule(userId, scheduleId);
    }


    @PaginatedResponse()
    @Post('schedules/date')
    @ApiOperation({ summary: '스케줄을 날짜 파라미터로 조회 API', description: '스케줄을를 조회한다.' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    async getSchedulesByDate(@Param('userId') userId, @Body() dateTimePaginationDto: DateTimePaginationDto) {
        return await this.scheduleService.getSchedulesByDate(userId, dateTimePaginationDto);
    }

    @PaginatedResponse()
    @Post('schedules/date')
    @ApiOperation({ summary: '스케줄과 투두를 날짜 body로 조회 API', description: '스케줄을를 조회한다.' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    async getSchedulesAndTodosByDate(@Param('userId') userId : string, @Body() dateTimePaginationDto: DateTimePaginationDto) {
        console.log(dateTimePaginationDto)
        return await this.scheduleService.getSchedulesAndTodosByDate(userId, dateTimePaginationDto);
    }

    @Get('search')
    @ApiOperation({ summary: '일정 검색 API', description: '일정를 검색한다.' })
    async searchSchedules(@Param('userId') userId : string, @Query('content') content : string,){
        return this.scheduleService.getSchedulesBySearch(userId, content)
    }

    @Get('holidays/date')
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    @ApiQuery({ name: 'endDate', type: String, required: true, description: '마지막 날짜' })
    @ApiQuery({ name: 'startDate', type: String, required: true, description: '시작 날짜' })
    async getHolidaysByDate(@Param('userId') userId, @Query() datePaginationDto: DatePaginationDto) {
        return await this.scheduleService.getHolidaysByDate(userId, datePaginationDto);
    }

    @Put(':scheduleId/repeat/front')
    @ApiOperation({ summary: '반복되는 일정 중 앞에거 내용 수정함', description: '일정를 수정한다.' })
    async updateRepeatScheduleFront(@Param('userId') userId: string,
        @Param('scheduleId') scheduleId : string,
        @Body() updateRepeatFrontScheduleBySplitDto: UpdateRepeatFrontScheduleBySplitDto){
        return this.scheduleService.updateRepeatScheduleFront(userId, scheduleId, updateRepeatFrontScheduleBySplitDto);
    }

    @Put(':scheduleId/repeat/middle')
    @ApiOperation({ summary: '반복되는 일정 중간거 내용 수정함', description: '일정를 수정한다.' })
    async updateRepeatScheduleMiddle(@Param('userId') userId: string,
        @Param('scheduleId') scheduleId : string,
        @Body() updateRepeatMiddleScheduleBySplitDto: UpdateRepeatMiddleScheduleBySplitDto){
        return this.scheduleService.updateRepeatScheduleMiddle(userId, scheduleId, updateRepeatMiddleScheduleBySplitDto);
    }

    @Put(':scheduleId/repeat/back')
    @ApiOperation({ summary: '반복되는 일정 중 마지막거 내용 수정함', description: '일정를 수정한다.' })
    async updateRepeatScheduleBack(@Param('userId') userId: string,
        @Param('scheduleId') scheduleId : string,
        @Body() updateRepeatBackScheduleBySplitDto: UpdateRepeatBackScheduleBySplitDto){
        return this.scheduleService.updateRepeatScheduleBack(userId, scheduleId, updateRepeatBackScheduleBySplitDto);
    }

    @Delete(':scheduleId/repeat/front')
    @ApiOperation({ summary: '반복되는 일정 중 앞에거 삭제함', description: '일정를 삭제한다.' })
    async deleteRepeatScheduleFront(@Param('userId') userId: string,
        @Param('scheduleId') scheduleId : string,
        @Body() repeatTodoCompleteBySplitDto: RepeatSplitFrontDto){
        return this.scheduleService.deleteRepeatScheduleFront(userId, scheduleId, repeatTodoCompleteBySplitDto);
    }

    @Delete(':scheduleId/repeat/middle')
    @ApiOperation({ summary: '반복되는 일정 중 중간거 삭제함', description: '일정를 삭제한다.' })
    async deleteRepeatScheduleMiddle(@Param('userId') userId: string,
        @Param('scheduleId') scheduleId : string,
        @Body() repeatTodoCompleteMiddleBySplitDto: RepeatSplitMiddleDto){
        return this.scheduleService.deleteRepeatScheduleMiddle(userId, scheduleId, repeatTodoCompleteMiddleBySplitDto);
    }

    @Delete(':scheduleId/repeat/back')
    @ApiOperation({ summary: '반복되는 일정 중 마지막거 삭제함', description: '일정를 삭제한다.' })
    async deleteRepeatScheduleBack(@Param('userId') userId: string,
        @Param('scheduleId') scheduleId : string,
        @Body() repeatTodoCompleteBySplitDto: RepeatSplitBackDto){
        return this.scheduleService.deleteRepeatScheduleBack(userId, scheduleId, repeatTodoCompleteBySplitDto);
    }
}
