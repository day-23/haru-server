import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";


export class CreateScheduleDto {
    @ApiProperty({ description: 'schedule 내용' })
    @MinLength(1)
    @MaxLength(200)
    @IsString()
    content: string;

    @ApiProperty({ description: 'schedule에 작성하는 메모' })
    @MaxLength(500)
    @IsString()
    memo: string;

    // @ApiProperty({ description: '오늘 할일인지 체크' })
    // @IsBoolean()
    // todaySchedule: boolean;

    // @ApiProperty({ description: '중요한 할일인지 체크' })
    // @IsBoolean()
    // flag: boolean;

    /* 일정 기간 */
    @ApiProperty({ description: '일정 시작 날짜', nullable: true })
    @IsOptional() /* nullable */
    @Transform(({ value }) => value ? new Date(value) : null)
    durationStart : Date;

    @ApiProperty({ description: '일정 끝 날짜', nullable: true })
    @IsOptional() /* nullable */
    @Transform(({ value }) => value ? new Date(value) : null)
    durationEnd : Date;

    /* 반복 설정 */
    @ApiProperty({ description: 'schedule 반복 주기 : 일, 주, 월, 년 등, 정해야함', nullable: true })
    @MaxLength(10)
    @IsOptional() /* nullable */
    repeatOption: string;

    @ApiProperty({ description: 'schedule 반복 방식, 월화수 반복의 경우 1110000 으로 표기', nullable: true })
    @MaxLength(7)
    @IsOptional() /* nullable */
    repeat: string;

    @ApiProperty({description:'반복 시작', nullable : true})
    @IsOptional()
    @Transform(({ value }) => value ? new Date(value) : null)
    repeatStart : Date;

    @ApiProperty({description:'반복 끝', nullable : true})
    @IsOptional()
    @Transform(({ value }) => value ? new Date(value) : null)
    repeatEnd : Date;

    @ApiProperty({ description: 'category 이름'})
    @IsString()
    category: string;

    @ApiProperty({ description: 'alarms 시간들' })
    @IsString({ each: true })
    alarms: string[];
}


export class UpdateScheduleDto extends PartialType(CreateScheduleDto){
}