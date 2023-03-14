import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginatedResponse } from 'src/common/decorators/paginated-response.decorator';
import { DatePaginationDto } from 'src/common/dto/date-pagination.dto';
import { Schedule } from 'src/entity/schedule.entity';
import { CreateAlarmByTimeDto } from 'src/todos/dto/create.todo.dto';
import { CreateScheduleDto } from './dto/create.schedule.dto';
import { ScheduleService } from './schedules.service';

@Controller('schedule/:userId')
@ApiTags('Schedule API')
export class ScheduleController {
    constructor(private readonly scheduleService: ScheduleService) { }

    @PaginatedResponse()
    @Get('schedules/date')
    @ApiOperation({ summary: '스케줄을 날짜 파라미터로 조회 API', description: '스케줄을를 조회한다.' })
    @ApiCreatedResponse({
        description: '스케줄을 페이지네이션 방식으로 조회한다.'
    })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    @ApiQuery({ name: 'endDate', type: String, required: true, description: '마지막 날짜' })
    @ApiQuery({ name: 'startDate', type: String, required: true, description: '시작 날짜' })
    async getSchedulesByDate(@Param('userId') userId, @Query() datePaginationDto: DatePaginationDto) {
        return await this.scheduleService.getSchedulesByDate(userId, datePaginationDto);
    }

    @Post()
    @ApiOperation({ summary: '스케줄 생성 API', description: '스케줄을 생성한다.' })
    async create(@Param('userId') userId: string, @Body() createTodoDto: CreateScheduleDto){
        return await this.scheduleService.createSchedule(userId, createTodoDto)
    }

    @Post(':scheduleId/alarm')
    @ApiOperation({ summary: '이미 생성된 스케줄러에 알람을 추가하는 API', description: '스케줄러에 알람을 추가한다.' })
    @ApiCreatedResponse({
        description: '이미 생성되어있는 스케줄러에 알람을 추가한다.'
    })
    async addAlarmToTodo(@Param('userId') userId: string, @Param('scheduleId') scheduleId: string,
            @Body() createAlarmByTimeDto:CreateAlarmByTimeDto) {
        return await this.scheduleService.createAlarmToSchedule(userId, scheduleId, createAlarmByTimeDto)
    }

}
