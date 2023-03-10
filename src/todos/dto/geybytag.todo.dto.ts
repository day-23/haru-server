import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength } from "class-validator";


export class GetByTagDto{
    @ApiProperty({ description: 'todo에 작성하는 메모' })
    @MaxLength(40)
    @IsString()
    tagId: string;
}