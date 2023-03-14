import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


/* subtodo 단일 생성 DTO */
export class CreateSubTodoDto {
    @ApiProperty({ example: "비문학", description: 'subtodo 단일 생성 DTO' })
    @IsNotEmpty()
    @IsString()
    content: string;
}
