import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsOptional } from "class-validator"

export class NotRepeatTodoCompleteDto{
    @ApiProperty({ example: "true / false", description: '투두 완료 여부 boolean' })
    @IsNotEmpty()
    @IsBoolean()
    completed : boolean
}

export class RepeatTodoCompleteBySplitDto{
    @ApiProperty({ description: '변하는 날짜, 해당 날짜 기준으로 스플릿됨'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    completedDate: Date;
}
