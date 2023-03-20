import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional } from "class-validator"
import { CreateTodoDto } from "./create.todo.dto";


export class NotRepeatTodoCompleteDto{
    @ApiProperty({ example: "true / false", description: '투두 완료 여부 boolean' })
    @IsNotEmpty()
    @IsBoolean()
    completed : boolean
}


/* 반복된 투두의 경우 마지막으로 완료인지, 아닌지 구분 */
export class completeRepeatTodoDto extends CreateTodoDto{
    @ApiProperty({description:'반복해야하는 다음 날짜, 반복이 끝났다면 null 값', nullable : true})
    @IsOptional()
    @Transform(({ value }) => value ? new Date(value) : null)
    nextDate : Date;
}