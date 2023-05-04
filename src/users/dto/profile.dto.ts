import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateProfileDto {
    @ApiProperty({ description: '이름' })
    @IsString()
    name: string;

    @ApiProperty({ description: '이름' })
    @IsString()
    introduction: string;
}
