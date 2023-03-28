import { ConflictException, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateCategoriesDto, CreateCategoryDto, DeleteCategoriesDto, UpdateCategoriesOrderDto, UpdateCategoryDto } from "src/categories/dto/create.category.dto";
import { BaseCategory } from "src/categories/interface/category.interface";
import { Category } from "src/entity/category.entity";
import { UserService } from "src/users/users.service";
import { In, Not, Repository } from "typeorm";

export class CategoryRepository {
    constructor(@InjectRepository(Category) private readonly repository: Repository<Category>,
    ) { }

    //Category
    /* 카테고리를 하나만 생성하는 코드 */
    async createCategory(userId: string, createCategoryDto: CreateCategoryDto): Promise<BaseCategory> {
        const { content, color } = createCategoryDto

        const [existingCategory, nextCategoryOrder] = await Promise.all([
            this.repository.findOne({ where: { user: { id: userId }, content } }),
            this.repository.createQueryBuilder('category')
                .select('MAX(category.categoryOrder)', 'maxOrder')
                .where('category.user = :userId', { userId })
                .getRawOne()
            ,])

        if (existingCategory) {
            throw new ConflictException(`Category with this user already exists`);
        }

        // save newCategory
        const newCategory = await this.repository.save({
            content,
            color,
            categoryOrder: nextCategoryOrder.maxOrder + 1,
            user: { id: userId },
        })
        return { id: newCategory.id, content: newCategory.content, color: newCategory.color, categoryOrder: newCategory.categoryOrder, isSelected: newCategory.isSelected }
    }

    async findAllCategoriesByUserId(userId: string): Promise<BaseCategory[]> {
        return await this.repository.createQueryBuilder('category')
            .select(['category.id', 'category.content', 'category.user', 'category.color', 'category.categoryOrder', 'category.isSelected'])
            .where('category.user.id = :userId', { userId })
            .orderBy('category.categoryOrder', 'ASC')
            .getMany()
    }

    async findCategoryByUserAndCategoryId(userId: string, categoryId: string): Promise<Category> {
        const existingCategory = await this.repository.findOne({ where: { id: categoryId } });

        if (!existingCategory) {
            throw new HttpException(
                'Category not found',
                HttpStatus.NOT_FOUND,
            );
        }

        return existingCategory
    }

    /* 단일 카테고리 수정 */
    async updateCategory(userId: string, categoryId: string, updateCategoryDto: UpdateCategoryDto): Promise<BaseCategory> {
        const promises = [this.findCategoryByUserAndCategoryId(userId, categoryId)]

        const { content } = updateCategoryDto
        if (content) {
            promises.push(this.repository.findOne({ where: { content, id: Not(categoryId) } }))
        }

        const [existingCategory, alreadyExistContent] = await Promise.all(promises)
        if (!existingCategory) {
            throw new HttpException(
                'Category not found',
                HttpStatus.NOT_FOUND,
            );
        }

        if (alreadyExistContent) {
            throw new ConflictException(`Category with this content already exists`);
        }

        try {
            const updatedCategory = new Category({
                ...existingCategory,
                ...updateCategoryDto,
            });
            return await this.repository.save(updatedCategory);
        } catch (error) {
            throw new HttpException(
                {
                    message: 'SQL error',
                    error: error.sqlMessage,
                },
                HttpStatus.FORBIDDEN,
            );
        }
    }


    /* 전체 카테고리 수정 */
    async updateCategoriesOrderAndIsSelected(userId: string, updateCategoriesOrderDto: UpdateCategoriesOrderDto): Promise<void> {
        const { categoryIds, isSelected } = updateCategoriesOrderDto
        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const promises = categoryIds.map((id, categoryOrder) =>
                queryRunner.manager.update(Category, { id }, { categoryOrder, isSelected: isSelected[categoryOrder] })
            );
            await Promise.all(promises);
            // Commit transaction
            await queryRunner.commitTransaction();
        } catch (err) {
            // Rollback transaction on error
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            // Release query runner
            await queryRunner.release();
        }
    }

    async deleteOneCategory(userId: string, categoryId: string): Promise<void> {
        const result = await this.repository.delete({
            user: { id: userId },
            id: categoryId
        });

        if (result.affected === 0) {
            throw new HttpException(
                `No category with ID ${categoryId} associated with user with ID ${userId} was found`,
                HttpStatus.NOT_FOUND,
            );
        }
    }

    async deleteCategories(userId: string, deleteCategoriesDto: DeleteCategoriesDto): Promise<void> {
        const result = await this.repository.delete({ id: In(deleteCategoriesDto.categoryIds), user: { id: userId } });

        if (result.affected === 0) {
            throw new HttpException(
                `No category with ID associated with user with ID ${userId} was found`,
                HttpStatus.NOT_FOUND,
            );
        }
    }
}