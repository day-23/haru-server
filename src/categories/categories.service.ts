import { Injectable } from '@nestjs/common';
import { Category } from 'aws-sdk/clients/cloudformation';
import { CategoryRepository } from 'src/repository/category.repository';
import { CreateCategoriesDto, DeleteCategoriesDto, UpdateCategoryDto } from './dto/create.category.dto';

@Injectable()
export class CategoriesService {
    constructor(private readonly categoryRepository: CategoryRepository) { }

    async createCategories(userId: string, createTagDto: CreateCategoriesDto) {
        return await this.categoryRepository.saveCategories(userId, createTagDto)
    }

    
    async getCategoriesByUserId(userId: string) {
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
