import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateTodoDto{
    @ApiProperty({description: 'todo를 작성한 user의 id값'})
    @IsString()
    @IsNotEmpty()
    userId: string; // 유저 아이디

    @ApiProperty({description: 'todo 내용'})
    @IsString()
    content: string;

    @ApiProperty({description: 'todo 반복 주기 : 일, 주, 월, 년 등, 정해야함'})
    @IsOptional() /* nullable */
    repeatOption: string;

    @ApiProperty({description: 'todo 반복 방식, 월화수 반복의 경우 1110000 으로 표기'})
    @IsOptional() /* nullable */
    repeat: string;

    @ApiProperty({description: 'todo에 작성하는 메모'})
    @IsString()
    memo: string;
}