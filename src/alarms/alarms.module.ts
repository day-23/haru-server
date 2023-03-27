import { Module } from '@nestjs/common';
import { AlarmsService } from './alarms.service';
import { AlarmsController } from './alarms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alarm } from 'src/entity/alarm.entity';
import { AlarmRepository } from 'src/repository/alarm.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Alarm])],
    controllers: [AlarmsController],
    providers: [AlarmsService, AlarmRepository],
    exports : [AlarmsService, AlarmRepository]
})
export class AlarmsModule { }
