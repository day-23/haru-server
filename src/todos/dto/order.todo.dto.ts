import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";


export class UpdateTodosOrderDto {
    @ApiProperty({ description: 'todoId 배열' })
    @IsString({ each: true })
    todoIds: string[];
}


export class UpdateTodosInTagOrderDto {
    @ApiProperty({ description: 'todoId 배열' })
    @IsString({ each: true })
    todoIds: string[];

    @ApiProperty({ description: 'tagId' })
    @IsString()
    tagId: string;
}

export class UpdateSubTodosOrderDto {
    @ApiProperty({ description: 'subTodoId 배열' })
    @IsString({ each: true })
    subTodoIds: string[];
}