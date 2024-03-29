import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDate } from "class-validator";
import { CreateScheduleDto } from "./create.schedule.dto";

export class UpdateRepeatFrontScheduleBySplitDto extends CreateScheduleDto{
    @ApiProperty({ description: '다음 반복 시작일'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    nextRepeatStart: Date;
}

export class UpdateRepeatMiddleScheduleBySplitDto extends CreateScheduleDto{
    @ApiProperty({ description: '완료된 날짜'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    changedDate: Date;
    
    @ApiProperty({ description: '다음 반복 시작일'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    nextRepeatStart: Date;
}

export class UpdateRepeatBackScheduleBySplitDto extends CreateScheduleDto{
    @ApiProperty({ description: '이전 마감일'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    preRepeatEnd: Date;
}

export class RepeatScheduleSplitFrontDto{
    @ApiProperty({ description: '다음 일정 시작일'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    repeatStart: Date;
}

export class RepeatScheduleSplitMiddleDto{
    @ApiProperty({ description: '삭제된 날짜'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    removedDate: Date;
    
    @ApiProperty({ description: '다음 일정 시작일'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    repeatStart: Date;
}

export class RepeatScheduleSplitBackDto{
    @ApiProperty({ description: '이전 일정 마지막일'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    repeatEnd: Date;
}