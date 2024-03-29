import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

/* 카테고리 단일 생성 DTO */
export class CreateCategoryDto {
    @ApiProperty({ example: "study", description: 'Category 단일 생성시 내용 입력' })
    @IsString()
    content: string;

    @ApiProperty({ example: "#????", description: '카테고리 색깔 헥사코드' })
    @IsOptional() /* nullable */
    @IsString()
    color: string;

    @ApiProperty({ example: "true", description: '카테고리 선택 여부' })
    @IsOptional()
    @IsBoolean()
    isSelected: boolean;
}

/* Category 여러개 생성 DTO 아마 안쓸듯*/
export class CreateCategoriesDto {
    @ApiProperty({ example: '["algorithm", "study", "health"]', description: 'Category 여러개 생성 DTO' })
    @IsString({ each: true })
    contents: string[];

    @ApiProperty({ example: "['#????', '#1231', '#1234']", description: '카테고리 색깔 헥사코드' })
    @IsOptional() /* nullable */
    colors: string[];
}

/* Category 단일 업데이트 DTO */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) { }


/* Category update DTO */
export class UpdateCategoriesOrderDto {
    @ApiProperty({ example: "['CategoryId1', 'CategoryId2', 'CategoryId3',]", description: 'Category 순서 수정을 위한 CategoryId 리스트' })
    @IsString({ each: true })
    categoryIds: string[];

    @ApiProperty({ example: "[true, false, true]", description: 'Category 선택 여부 수정을 위한 CategoryId 리스트' })
    @IsBoolean({ each: true })
    isSelected: boolean[];
}


/* Category delete DTO */
export class DeleteCategoriesDto {
    @ApiProperty({ example: "['CategoryId1', 'CategoryId2', 'CategoryId3',]", description: 'Category 삭제를 위한 CategoryId 리스트' })
    @IsString({ each: true })
    categoryIds: string[];
}