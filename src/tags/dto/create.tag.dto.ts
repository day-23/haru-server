import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsString, Min } from 'class-validator';

/* tag 단일 생성 DTO */
export class CreateTagDto {
    @ApiProperty({ example: "study", description: 'tag 단일 생성 DTO' })
    contents: string;
}

/* tag 여러개 생성 DTO */
export class CreateTagsDto {
    @ApiProperty({ example: '["algorithm", "study", "health"]', description: 'tag 여러개 생성 DTO' })
    @IsString({ each: true })
    contents: string[];
}

/* tag 단일 업데이트 DTO */
export class UpdateTagDto extends PartialType(CreateTagDto){}