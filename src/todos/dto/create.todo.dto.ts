import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";


export class CreateAlarmByTimeDto{
    @ApiProperty({ example: "2023-03-09T18:30:00.123+09:00", description: 'alarm 단일 생성 DTO' })
    @IsNotEmpty()
    @Transform(({ value }) => new Date(value))
    time: Date;
}

export class CreateTodoDto {
    @ApiProperty({ description: 'todo 내용' })
    @MinLength(1)
    @MaxLength(200)
    @IsString()
    content: string;

    @ApiProperty({ description: 'todo에 작성하는 메모' })
    @MaxLength(500)
    @IsString()
    memo: string;

    @ApiProperty({ description: '오늘 할일인지 체크' })
    @IsBoolean()
    todayTodo: boolean;

    @ApiProperty({ description: '중요한 할일인지 체크' })
    @IsBoolean()
    flag: boolean;

    @ApiProperty({ description: 'endDate에서 time 까지 사용하는지 여부'})
    @IsBoolean()
    isSelectedEndDateTime : boolean;

    @ApiProperty({ description: '마감날짜', nullable: true })
    @IsOptional() /* nullable */
    @Transform(({ value }) => value ? new Date(value) : null)
    endDate : Date;

    /* 반복 설정 관련 */
    @ApiProperty({ description: 'todo 반복 주기 : 일, 주, 월, 년 등, 정해야함', nullable: true })
    @MaxLength(10)
    @IsOptional() /* nullable */
    repeatOption: string;

    @ApiProperty({ description: 'todo 반복 방식, repeatOption에 따라 다른 값', nullable: true })
    @MaxLength(31)
    @IsOptional() /* nullable */
    repeatValue: string;

    @ApiProperty({description:'반복 끝', nullable : true})
    @IsOptional()
    @Transform(({ value }) => value ? new Date(value) : null)
    repeatEnd : Date;

    @ApiProperty({ description: 'tag의 이름들' })
    @IsString({ each: true })
    tags: string[];

    @ApiProperty({ description: 'subTodos의 내용들' })
    @IsString({ each: true })
    subTodos: string[];

    @ApiProperty({ description: 'alarms 시간들' })
    @IsString({ each: true })
    alarms: string[];
}


export class UpdateTodoDto extends PartialType(CreateTodoDto){
    @ApiProperty({ description: '완료인지 여부' })
    @IsOptional()
    @IsBoolean()
    completed: boolean;
}