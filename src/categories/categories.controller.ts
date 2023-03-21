import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Category } from 'src/entity/category.entity';
import { CategoriesService } from './categories.service';
import { CreateCategoriesDto, CreateCategoryDto, DeleteCategoriesDto, UpdateCategoriesOrderDto, UpdateCategoryDto } from './dto/create.category.dto';
import { BaseCategory } from './interface/category.interface';

@ApiTags('Category API')
@Controller('category/:userId')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    @ApiOperation({ summary: '카테고리 생성 API', description: '카테고리를 생성한다.' })
    @ApiBody({ type: CreateCategoryDto, description: 'Request body example' })
    @ApiCreatedResponse({
        description: '카테고리를 생성한다. 해당 사용자가 이미 사용하는 카테고리를 입력하는 경우, 새로 생성하진 않음'
    })
    async createCategory(@Param('userId') userId: string, @Body() createCategoryDto: CreateCategoryDto){
        return await this.categoriesService.createCategory(userId, createCategoryDto)
    }
    

    @Post('categories')
    @ApiOperation({ summary: '카테고리 생성 API', description: '카테고리를 생성한다.' })
    @ApiBody({ type: CreateCategoriesDto, description: 'Request body example' })
    @ApiCreatedResponse({
        description: '카테고리를 생성한다. 해당 사용자가 이미 사용하는 카테고리를 입력하는 경우, 새로 생성하진 않음'
    })
    async create(@Param('userId') userId: string, @Body() createCategoriesDto: CreateCategoriesDto): Promise<Category[]> {
        return await this.categoriesService.createCategories(userId, createCategoriesDto)
    }
    
    @Get('categories')
    @ApiOperation({ summary: '사용자의 모든 카테고리 조회 API' })
    async getTagsByUserId(@Param('userId') userId: string): Promise<BaseCategory[]>  {
        return await this.categoriesService.getCategoriesByUserId(userId)
    }

    @Patch(':categoryId')
    @ApiOperation({ summary: '카테고리 업데이트 API' })
    async updateCategory(@Param('userId') userId: string, @Param('categoryId') categoryId: string, @Body() updateTagDto: UpdateCategoryDto): Promise<BaseCategory> {
        return this.categoriesService.updateCategory(userId, categoryId, updateTagDto);
    }

    @Patch('order/categories')
    @ApiOperation({ summary: '카테고리 전체 순서 수정 API' })
    @ApiBody({ type: UpdateCategoriesOrderDto, description: 'Request body example' })
    async updateCategoriesOrderAndIsSelected(
        @Param('userId') userId: string,
        @Body() updateCategoriesOrderDto: UpdateCategoriesOrderDto,
    ): Promise<void> {
        return await this.categoriesService.updateCategoriesOrderAndIsSelected(userId, updateCategoriesOrderDto);
    }

    @Delete('categories')
    @ApiOperation({ summary: '카테고리 여러개 삭제 API' })
    @ApiBody({ type: DeleteCategoriesDto, description: 'Request body example' })
    async deleteCategories(
        @Param('userId') userId: string,
        @Body() deleteCategoriesDto: DeleteCategoriesDto,
    ): Promise<void> {
        return await this.categoriesService.deleteCategories(userId, deleteCategoriesDto);
    }

}
