import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

/* tag 단일 생성 DTO */
export class CreateTagDto {
    @ApiProperty({ example: "study", description: 'tag 단일 생성 DTO' })
    @IsNotEmpty()
    @IsString()
    content: string;
}

/* tag 여러개 생성 DTO */
export class CreateTagsDto {
    @ApiProperty({ example: '["algorithm", "study", "health"]', description: 'tag 여러개 생성 DTO' })
    @IsString({ each: true })
    contents: string[];
}

export class UpdateTagsOrderDto{
    @ApiProperty({ example: "['TagId1', 'TagId2', 'TagId3',]", description: 'Tag 순서 수정을 위한 TagId 리스트' })
    @IsString({ each: true })
    tagIds: string[];

    @ApiProperty({ example: "[true, false, true]", description: 'Tag 선택 여부 수정을 위한 TagId 리스트' })
    @IsBoolean({ each: true })
    isSelected: boolean[];
}

/* tag 단일 업데이트 DTO */
export class UpdateTagDto extends PartialType(CreateTagDto) { 
    @IsOptional()
    @IsBoolean()
    isSelected : boolean;
}

/* tag delete DTO */
export class DeleteTagsDto {
    @ApiProperty({ example: "['tagId1', 'tagId2', 'tagId3',]", description: 'tag 삭제를 위한 tagId 리스트' })
    @IsString({each:true})
    tagIds: string[];
}
