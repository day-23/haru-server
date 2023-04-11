import { BadRequestException } from "@nestjs/common";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsDefined, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";


export class CreatePostDto {
    @ApiProperty({ description: 'post 내용' })
    @MinLength(1)
    @MaxLength(200)
    @IsString()
    content: string;

    @IsString({ each: true })
    hashTags: string[];
}

export class UpdatePostDto extends PartialType(CreatePostDto) {}

