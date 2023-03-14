import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateCategoriesDto, DeleteCategoriesDto, UpdateCategoryDto } from "src/categories/dto/create.category.dto";
import { Category } from "src/entity/category.entity";
import { In, Repository } from "typeorm";

export class CategoryRepository {
    constructor(@InjectRepository(Category) private readonly repository: Repository<Category>,
    ) { }

    //Category
    /* 태그를 한번에 여러개 생성하는 코드 */
    async saveCategories(userId: string, createCategoriesDto: CreateCategoriesDto) {
        const existingCategories = await this.repository.find({
            where: {
                user: { id: userId },
                content: In(createCategoriesDto.contents)
            }
        });

        const newCategories = createCategoriesDto.contents
            .filter(content => !existingCategories.some(category => category.content === content))
            .map((content) => ({
                user: userId,
                content
            }));

        const createdCategories = await this.repository.save(newCategories);
        return [...createdCategories, ...existingCategories];
    }

    async findAllCategoriesByUserId(userId: string): Promise<Category[]> {
        return await this.repository.createQueryBuilder('category')
            .select(['category.id', 'category.content', 'category.user'])
            .where('category.user.id = :userId', { userId })
            .getMany()
    }

    async findCategoryByUserAndCategoryId(userId: string, categoryId: string): Promise<Category> {
        return this.repository.findOne({ where: { id: categoryId, user: { id: userId } } });
    }

    async updateCategory(userId: string, categoryId: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        /* CategoryId와 userId로 쿼리 */
        const existingCategory = await this.findCategoryByUserAndCategoryId(userId, categoryId);
        if (!existingCategory) {
            throw new HttpException(
                'Category not found',
                HttpStatus.NOT_FOUND,
            );
        }

        try {
            const updatedCategory = new Category({
                ...existingCategory,
                ...updateCategoryDto,
            });
            return this.repository.save(updatedCategory);
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
        const result = await this.repository.delete({ id: In(deleteCategoriesDto.categoryIds), user: userId });

        if (result.affected === 0) {
            throw new HttpException(
                `No category with ID associated with user with ID ${userId} was found`,
                HttpStatus.NOT_FOUND,
            );
        }
    }
}