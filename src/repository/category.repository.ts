import { ConflictException, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateCategoriesDto, CreateCategoryDto, DeleteCategoriesDto, UpdateCategoriesOrderDto, UpdateCategoryDto } from "src/categories/dto/create.category.dto";
import { BaseCategory } from "src/categories/interface/category.interface";
import { Category } from "src/entity/category.entity";
import { UserService } from "src/users/users.service";
import { In, Repository } from "typeorm";

export class CategoryRepository {
    constructor(@InjectRepository(Category) private readonly repository: Repository<Category>,
    private readonly userService: UserService,
    ) { }

    //Category
    /* 카테고리를 하나만 생성하는 코드 */
    async createCategory(userId: string, createCategoryDto: CreateCategoryDto) : Promise<BaseCategory> {
        const { content, color } = createCategoryDto
        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const [updatedUser, existingCategory] = await Promise.all([
                this.userService.updateNextOrder(userId, 'nextCategoryOrder'),
                this.repository.findOne({
                    where: {
                        user: { id: userId },
                        content
                    }
                })
            ])
            if (existingCategory) {
                throw new ConflictException(`Category with this user already exists`);
            }
            const { nextCategoryOrder } = updatedUser

            const newCategory = this.repository.create({ user: userId, content, color, categoryOrder: nextCategoryOrder })
            const savedCategory = await this.repository.save(newCategory)

            return { id: savedCategory.id, content: savedCategory.content, color: savedCategory.color, categoryOrder: savedCategory.categoryOrder, isSelected: savedCategory.isSelected }
        } catch (error) {
            await queryRunner.rollbackTransaction();

            if (error instanceof ConflictException) {
                throw error;
            }
            
            throw new HttpException(
                {
                    message: 'SQL error',
                    error: error.sqlMessage,
                },
                HttpStatus.FORBIDDEN,
            );
        } finally {
            await queryRunner.release();
        }        
    }

    //Category
    /* 카테고리를 한번에 여러개 생성하는 코드 */
    async createCategories(userId: string, createCategoriesDto: CreateCategoriesDto) {
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
            promises.push(this.repository.findOne({ where: { content } }))
        }

        const [existingCategory, alreadyExistContent] = await Promise.all(promises)
        if (!existingCategory) {
            throw new HttpException(
                'Category not found',
                HttpStatus.NOT_FOUND,
            );
        }

        if(alreadyExistContent){
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
    async updateCategoriesOrder(userId: string, updateCategoriesOrderDto: UpdateCategoriesOrderDto): Promise<void> {
        const { categoryIds } = updateCategoriesOrderDto
        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const promises = categoryIds.map((id, categoryOrder) =>
                queryRunner.manager.update(Category, { id }, { categoryOrder })
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
        const result = await this.repository.delete({ id: In(deleteCategoriesDto.categoryIds), user: userId });

        if (result.affected === 0) {
            throw new HttpException(
                `No category with ID associated with user with ID ${userId} was found`,
                HttpStatus.NOT_FOUND,
            );
        }
    }
}