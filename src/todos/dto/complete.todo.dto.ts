import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional } from "class-validator"

export class NotRepeatTodoCompleteDto{
    @ApiProperty({ example: "true / false", description: '투두 완료 여부 boolean' })
    @IsNotEmpty()
    @IsBoolean()
    completed : boolean
}
