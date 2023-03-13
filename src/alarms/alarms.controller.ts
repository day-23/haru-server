import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { swaggerTodoCreateExample } from 'src/common/swagger/todo.example';
import { Alarm } from 'src/entity/alarm.entity';
import { AlarmsService } from './alarms.service';
import { CreateAlarmDto, CreateAlarmsDto } from './dto/create.alarm.dto';


@ApiTags('Alarm API')
@Controller('alarm/:userId')
export class AlarmsController {
    constructor(private readonly alarmService: AlarmsService) { }

    @Post('alarms')
    @ApiOperation({ summary: '알람 생성 API', description: '알람을 여러개 생성한다.' })
    @ApiCreatedResponse({
        description: '알람을 생성한다.', schema: {
            example: swaggerTodoCreateExample
        }
    })
    async create(@Param('userId') userId: string, @Body() createAlarmDto: CreateAlarmsDto): Promise<Alarm[]> {
        return await this.alarmService.createAlarms(userId, createAlarmDto)
    }

    @Delete(':alarmId')
    @ApiOperation({ summary: '알람 하나 삭제 API', description: '알람을 삭제한다.' })
    @ApiCreatedResponse({
        description: '알람을 삭제한다.'
    })
    async delete(@Param('userId') userId: string,
        @Param('alarmId') alarmId: string): Promise<void> {
        return this.alarmService.deleteAlarm(userId, alarmId);
    }

}
