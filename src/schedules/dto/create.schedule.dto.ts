import { BadRequestException } from "@nestjs/common";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsDefined, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";


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

    @ApiProperty({ description: '중요한 할일인지 체크' })
    @IsBoolean()
    flag: boolean;

    /* 반복 설정 */
    @ApiProperty({ description: 'schedule 반복 주기 : 일, 주, 월, 년 등, 정해야함', nullable: true })
    @MaxLength(10)
    @IsOptional() /* nullable */
    repeatOption: string;

    @ApiProperty({ description: 'schedule 반복 방식, 월화수 반복의 경우 1110000 으로 표기', nullable: true })
    @MaxLength(7)
    @IsOptional() /* nullable */
    repeatWeek: string;

    @ApiProperty({ description: 'schedule 반복 방식, 월화수 반복의 경우 1110000....01 31 자리로 표기', nullable: true })
    @MaxLength(31)
    @IsOptional() /* nullable */
    repeatMonth: string;

    @ApiProperty({description:'반복 시작', nullable : true})
    @IsOptional()
    @Transform(({ value }) => value ? new Date(value) : null)
    repeatStart : Date;

    @ApiProperty({description:'반복 끝', nullable : true})
    @IsOptional()
    @Transform(({ value }) => value ? new Date(value) : null)
    repeatEnd : Date;

    @ApiProperty({ description: 'category id'})
    @IsOptional()
    @IsString()
    categoryId: string;

    @ApiProperty({ description: 'alarms 시간들' })
    @IsString({ each: true })
    alarms: string[];
}


export class UpdateScheduleDto extends PartialType(CreateScheduleDto){
    @IsDefined()
    @IsOptional()
    @IsString()
    category?: string;

    @IsDefined()
    @IsOptional()
    @IsString({ each: true })
    alarms?: string[];

    // validation function to check if category or alarms are not undefined
    validateFields() {
        if (this.category !== undefined || (this.alarms && this.alarms.length > 0)) {
            throw new BadRequestException('Category and alarms fields cannot be updated in this API');
        }
    }
}