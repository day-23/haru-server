import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";



export class CreatePostDto {
    @ApiProperty({ description: 'post 내용' })
    @MaxLength(1000)
    @IsString()
    content: string;

    @IsString({ each: true })
    @IsOptional()
    hashTags: string[];
}

export class CreateTemplatePostDto extends CreatePostDto {
    @IsString()
    templateId: string;

    @IsString()
    templateTextColor: string;
}


export class UpdatePostDto extends PartialType(CreatePostDto) {}

