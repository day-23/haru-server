import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";


/* subtodo 단일 생성 DTO */
export class CreateSubTodoDto {
    @ApiProperty({ example: "비문학", description: 'subtodo 단일 생성 DTO' })
    @IsNotEmpty()
    @IsString()
    content: string;
}

export class CreateSubTodosDto {
    @ApiProperty({ example: "[비문학, 문학, etc]", description: 'subtodo 단일 생성 DTO' })
    @IsNotEmpty()
    @IsString({each: true})
    contents: string[];
}


export class UpdateSubTodoDto extends PartialType(CreateSubTodoDto){
    @ApiProperty({ description: '완료인지 여부' })
    @IsOptional()
    @IsBoolean()
    completed: boolean;
}