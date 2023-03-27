import { Injectable } from '@nestjs/common';
import { Category } from 'src/entity/category.entity';
import { CategoryRepository } from 'src/repository/category.repository';
import { CreateCategoriesDto, CreateCategoryDto, DeleteCategoriesDto, UpdateCategoriesOrderDto, UpdateCategoryDto } from './dto/create.category.dto';
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

    
    async getCategoriesByUserId(userId: string): Promise<BaseCategory[]>  {
        return await this.categoryRepository.findAllCategoriesByUserId(userId)
    }

    async updateCategory(userId: string, categoryId: string, updateCategoryDto: UpdateCategoryDto): Promise<BaseCategory> {
        return await this.categoryRepository.updateCategory(userId, categoryId, updateCategoryDto);
    }
      
    async updateCategoriesOrderAndIsSelected(userId: string, updateCategoriesOrderDto: UpdateCategoriesOrderDto): Promise<void> {
        return await this.categoryRepository.updateCategoriesOrderAndIsSelected(userId, updateCategoriesOrderDto);
    }

    async deleteCategories(
        userId: string, deleteTagsDto: DeleteCategoriesDto,
    ): Promise<void> {
        return await this.categoryRepository.deleteCategories(userId, deleteTagsDto);
    }
}
