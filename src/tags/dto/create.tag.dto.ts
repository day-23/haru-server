import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsString, Min } from 'class-validator';

/* tag 단일 생성 DTO */
export class CreateTagDto {
    @ApiProperty({ example: "study", description: 'tag 단일 생성 DTO' })
    content: string;
}

/* tag 여러개 생성 DTO */
export class CreateTagsDto {
    @ApiProperty({ example: '["algorithm", "study", "health"]', description: 'tag 여러개 생성 DTO' })
    @IsString({ each: true })
    contents: string[];
}

/* tag 단일 업데이트 DTO */
export class UpdateTagDto extends PartialType(CreateTagDto) { }

/* tag delete DTO */
export class DeleteTagsDto {
    @ApiProperty({ example: "['tagId1', 'tagId2', 'tagId3',]", description: 'tag 삭제를 위한 tagId 리스트' })
    @IsString({each:true})
    tagIds: string[];
}
