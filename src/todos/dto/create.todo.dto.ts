import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class BaseTodoDto {
    @ApiProperty({ description: '오늘 할일인지 체크' })
    @IsBoolean()
    todayTodo: boolean;

    @ApiProperty({ description: '중요한 할일인지 체크' })
    @IsBoolean()
    flag: boolean;

    @ApiProperty({ description: '중요한 할일인지 체크' })
    @IsOptional()
    @IsBoolean()
    folded: boolean;

    @ApiProperty({ description: '완료인지 여부' })
    @IsOptional()
    @IsBoolean()
    completed: boolean;

    @ApiProperty({ description: '부모 id' })
    @IsOptional()
    @IsString()
    parent: string;
}

export class CreateBaseTodoDto extends BaseTodoDto {}



export class CreateTodoDto extends BaseTodoDto {
    @ApiProperty({ description: 'todo 내용' })
    @MinLength(1)
    @MaxLength(200)
    @IsString()
    content: string;

    @ApiProperty({ description: 'todo에 작성하는 메모' })
    @MaxLength(500)
    @IsString()
    memo: string;

    @ApiProperty({ description: '할일을 하루종일 하는건지 여부' })
    @IsBoolean()
    isAllDay: boolean;

    /* 반복 설정 관련 */
    @ApiProperty({ description: 'todo 반복 주기 : 일, 주, 월, 년 등, 정해야함', nullable: true })
    @MaxLength(10)
    @IsOptional() /* nullable */
    repeatOption: string;

    @ApiProperty({ description: 'todo 반복 방식, repeatOption에 따라 다른 값', nullable: true })
    @MaxLength(31)
    @IsOptional() /* nullable */
    repeatValue: string;

    @ApiProperty({ description: '마감날짜', nullable: true })
    @IsOptional() /* nullable */
    @Transform(({ value }) => value ? new Date(value) : null)
    endDate: Date;

    @ApiProperty({ description: '반복 끝', nullable: true })
    @IsOptional()
    @Transform(({ value }) => value ? new Date(value) : null)
    repeatEnd: Date;

    @ApiProperty({ description: 'tag의 이름들' })
    @IsString({ each: true })
    tags: string[];

    @ApiProperty({ description: 'subTodos의 내용들' })
    @IsString({ each: true })
    subTodos: string[];

    @ApiProperty({ description: 'alarms 시간들' })
    @IsString({ each: true })
    alarms: Date[];
}

export class UpdateTodoDto extends CreateTodoDto {
    @ApiProperty({ description: '할일 완료 여부' })
    @IsOptional()
    @IsBoolean()
    completed: boolean;

    @ApiProperty({ description: '하위항목 완료 여부' })
    @IsOptional()
    @IsBoolean({ each: true })
    subTodosCompleted: boolean[];
}

export class UpdateSubTodosDtoWhenUpdateTodo{
    @ApiProperty({ description: 'subTodos의 내용들' })
    @IsString({ each: true })
    contents: string[];

    @ApiProperty({ description: '하위항목 완료 여부' })
    @IsBoolean({each : true})
    subTodosCompleted: boolean[];
}