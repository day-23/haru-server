import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";



export class CreatePostDto {
    @ApiProperty({ description: 'post 내용' })
    @MinLength(1)
    @MaxLength(200)
    @IsString()
    content: string;

    @IsString({ each: true })
    hashTags: string[];
}

export class CreateTemplatePostDto extends CreatePostDto {
    @IsString()
    templateId: string;
}


export class UpdatePostDto extends PartialType(CreatePostDto) {}

