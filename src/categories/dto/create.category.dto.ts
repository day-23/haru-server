import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsString } from "class-validator";

/* tag 단일 생성 DTO */
export class CreateCategoryDto {
    @ApiProperty({ example: "study", description: 'Category 단일 생성 DTO' })
    content: string;
}

/* Category 여러개 생성 DTO */
export class CreateCategoriesDto {
    @ApiProperty({ example: '["algorithm", "study", "health"]', description: 'Category 여러개 생성 DTO' })
    @IsString({ each: true })
    contents: string[];
}

/* Category 단일 업데이트 DTO */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) { }

/* Category delete DTO */
export class DeleteCategoriesDto {
    @ApiProperty({ example: "['CategoryId1', 'CategoryId2', 'CategoryId3',]", description: 'Category 삭제를 위한 CategoryId 리스트' })
    @IsString({each:true})
    categoryIds: string[];
}
