import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";



export class CreateTodoDto {
    @ApiProperty({ description: 'todo 내용' })
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

    @ApiProperty({ description: 'todo 반복 주기 : 일, 주, 월, 년 등, 정해야함', nullable: true })
    @MaxLength(10)
    @IsOptional() /* nullable */
    repeatOption: string;

    @ApiProperty({description:'반복 끝', nullable : true})
    @IsOptional()
    repeatEnd : string;

    @ApiProperty({ description: 'todo 반복 방식, 월화수 반복의 경우 1110000 으로 표기', nullable: true })
    @MaxLength(7)
    @IsOptional() /* nullable */
    repeat: string;

    @ApiProperty({ description: 'todo 반복 방식, 월화수 반복의 경우 1110000 으로 표기', nullable: true })
    @IsOptional() /* nullable */
    endDate : Date;

    @ApiProperty({ description: 'tag의 이름들' })
    @IsString({ each: true })
    tags: string[];
}