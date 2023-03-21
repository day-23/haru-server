import { Injectable } from '@nestjs/common';
import { Category } from 'src/entity/category.entity';
import { CategoryRepository } from 'src/repository/category.repository';
import { CreateCategoriesDto, CreateCategoryDto, DeleteCategoriesDto, UpdateCategoryDto } from './dto/create.category.dto';
import { BaseCategory } from './interface/category.interface';

@Injectable()
export class CategoriesService {
    constructor(private readonly categoryRepository: CategoryRepository) { }

    async createCategory(userId: string, createCategoryDto: CreateCategoryDto){
        return await this.categoryRepository.createCategory(userId, createCategoryDto)
    }

    async getCategoryById(userId : string, categoryId : string): Promise<Category>{
        return await this.categoryRepository.findCategoryByUserAndCategoryId(userId, categoryId)
    }
    
    async createCategories(userId: string, createTagDto: CreateCategoriesDto) {
        return await this.categoryRepository.createCategories(userId, createTagDto)
    }
    
    async getCategoriesByUserId(userId: string): Promise<BaseCategory[]>  {
        return await this.categoryRepository.findAllCategoriesByUserId(userId)
    }

    async updateCategory(userId: string, categoryId: string, updateCategoryDto: UpdateCategoryDto): Promise<string[]> {
        const category = await this.categoryRepository.updateCategory(userId, categoryId, updateCategoryDto);
        return [category.id];
    }
      
    async deleteCategories(
        userId: string, deleteTagsDto: DeleteCategoriesDto,
    ): Promise<void> {
        return await this.categoryRepository.deleteCategories(userId, deleteTagsDto);
    }
}
