import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateProfileDto {
    @ApiProperty({ description: '이름' })
    @IsString()
    name: string;

    @ApiProperty({ description: '이름' })
    @IsString()
    introduction: string;

    @IsOptional()
    profileImageUrl: string;
}


export class UpdateInitialProfileDto {
    @ApiProperty({ description: '이름' })
    @IsString()
    name: string;

    @ApiProperty({ description: '이름' })
    @IsOptional()
    @IsString()
    introduction: string;

    @IsOptional()
    profileImageUrl: string;

    @ApiProperty({ description: '검색용 아이디' })
    @IsString()
    haruId: string
}
