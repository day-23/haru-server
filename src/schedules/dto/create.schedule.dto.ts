import { BadRequestException } from "@nestjs/common";
import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsDate, IsDefined, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";


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

    @ApiProperty({ description: '일정이 시간까지 포함인지 여부' })
    @IsBoolean()
    isAllDay: boolean;

    @ApiProperty({ description: '반복 시작'})
    @IsOptional()
    @Transform(({ value }) => new Date(value))
    repeatStart: Date;

    @ApiProperty({ description: '반복 끝'})
    @IsOptional()
    @Transform(({ value }) => new Date(value))
    repeatEnd: Date;

    /* 반복 설정 */
    @ApiProperty({ description: 'schedule 반복 주기 : 일, 주, 월, 년 등, 정해야함', nullable: true })
    @MaxLength(10)
    @IsOptional() /* nullable */
    repeatOption: string;

    @ApiProperty({ description: 'schedule 반복 방식, repeatOption에 따라 다른 값 월화수 반복의 경우 1110000 으로 표기', nullable: true })
    @MaxLength(31)
    @IsOptional() /* nullable */
    repeatValue: string;

    @ApiProperty({ description: 'category id' })
    @IsOptional()
    @IsString()
    categoryId: string;

    @ApiProperty({ description: 'alarms 시간들' })
    @IsString({ each: true })
    alarms: Date[];

    @ApiProperty({ description: '부모 id' })
    @IsOptional()
    @IsString()
    parent: string;
}

export class UpdateScheduleBySplitDto extends CreateScheduleDto{
    @ApiProperty({ description: '변하는 날짜, 해당 날짜 기준으로 스플릿됨'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    changedDate: Date;
}

export class CreateScheduleWithoutAlarmsDto extends OmitType(CreateScheduleDto, ['alarms']) {}

/* repeatStart, repeatEnd 바꾸기 위함 */
export class UpdateSchedulePartialDto extends PartialType(OmitType(CreateScheduleDto, ['alarms'])){}

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
    @IsDefined()
    @IsOptional()
    @IsString()
    category?: string;

    @IsDefined()
    @IsOptional()
    alarms?: Date[];
}