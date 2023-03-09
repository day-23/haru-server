import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";


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

    @ApiProperty({ description: '마감날짜', nullable: true })
    @IsOptional() /* nullable */
    @Transform(({ value }) => new Date(value))
    endDate : Date;

    @ApiProperty({ description: '마감날짜+시간', nullable: true })
    @IsOptional() /* nullable */
    @Transform(({ value }) => new Date(value))
    endDateTime : Date;

    @ApiProperty({ description: 'todo 반복 주기 : 일, 주, 월, 년 등, 정해야함', nullable: true })
    @MaxLength(10)
    @IsOptional() /* nullable */
    repeatOption: string;

    @ApiProperty({description:'반복 끝', nullable : true})
    @IsOptional()
    @Transform(({ value }) => new Date(value))
    repeatEnd : Date;

    @ApiProperty({ description: 'todo 반복 방식, 월화수 반복의 경우 1110000 으로 표기', nullable: true })
    @MaxLength(7)
    @IsOptional() /* nullable */
    repeat: string;

    @ApiProperty({ description: 'tag의 이름들' })
    @IsString({ each: true })
    tags: string[];

    @ApiProperty({ description: 'subTodos의 내용들' })
    @IsString({ each: true })
    subTodos: string[];
}


export class UpdateTodoDto extends PartialType(CreateTodoDto){
}