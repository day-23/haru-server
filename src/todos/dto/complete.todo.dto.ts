import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional } from "class-validator"


/* 반복된 투두의 경우 마지막으로 완료인지, 아닌지 구분 */
export class completeRepeatTodoDto{
    @ApiProperty({ example: "false", description: 'subtodo 단일 생성 DTO' })
    @IsNotEmpty()
    @IsBoolean()
    lastCompleted : boolean

    @ApiProperty({description:'반복해야하는 다음 날짜', nullable : true})
    @IsOptional()
    @Transform(({ value }) => value ? new Date(value) : null)
    nextDate : Date;
}