import { ConflictException, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Tag } from "src/entity/tag.entity";
import { CreateTagDto, CreateTagsDto, DeleteTagsDto, UpdateTagDto, UpdateTagsOrderDto } from "src/tags/dto/create.tag.dto";
import { BaseTag } from "src/tags/interface/tag.interface";
import { UserService } from "src/users/users.service";
import { In, Repository } from "typeorm";


export class TagRepository {
    constructor(@InjectRepository(Tag) private readonly repository: Repository<Tag>,
    private readonly userService : UserService
    ) { }

    async saveTag(userId: string, createTagDto: CreateTagDto) {
        const { content } = createTagDto;
        const existingTag = await this.repository.findOne({ where: { user: { id: userId }, content } });

        if (existingTag) {
            throw new ConflictException(`Tag with this user already exists`);
        }

        const newTag = this.repository.create({ user: userId, content});
        const ret = await this.repository.save(newTag);
        return { id: ret.id, content }
    }


    /* 태그를 한번에 여러개 생성하는 코드 */
    async saveTags(userId: string, createTagsDto: CreateTagsDto) {
        let { nextTagOrder } = await this.userService.findOne(userId);
        
        const existingTags = await this.repository.find({
            where: {
                user: { id: userId },
                content: In(createTagsDto.contents)
            }
        });

        const newTags = createTagsDto.contents
            .filter(content => !existingTags.some(tag => tag.content.toUpperCase() === content.toUpperCase()))
            .map(content => {
                const newTag = new Tag({
                    user: userId,
                    content,
                    tagOrder : nextTagOrder++
                });
                return newTag;
            });

        const [createdTags, updateUser] = await Promise.all([
            this.repository.save(newTags),
            this.userService.updateUser(userId, {nextTagOrder})
        ]) 

        return [...createdTags, ...existingTags];
    }

    async findAllTagsByUserId(userId: string): Promise<BaseTag[]> {
        return await this.repository.createQueryBuilder('tag')
            .select(['tag.id', 'tag.content', 'tag.user', 'tag.tagOrder', 'tag.isSelected'])
            .where('tag.user.id = :userId', { userId })
            .orderBy('tag.tagOrder', 'ASC')
            .getMany()
    }

    async findTagByUserAndTagId(userId: string, tagId: string): Promise<Tag> {
        return this.repository.findOne({ where: { id: tagId, user: { id: userId } } });
    }

    async updateTag(userId: string, tagId: string, updateTagDto: UpdateTagDto): Promise<Tag> {
        /* tagId와 userId로 쿼리 */
        const existingTag = await this.findTagByUserAndTagId(userId, tagId);
        if (!existingTag) {
            throw new HttpException(
                'Tag not found',
                HttpStatus.NOT_FOUND,
            );
        }

        try {
            const updatedTag = new Tag({
                ...existingTag,
                ...updateTagDto,
            });
            return this.repository.save(updatedTag);
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


    /* 전체 태그 수정 */
    async updateTagsOrder(userId: string, updateTagsOrderDto: UpdateTagsOrderDto): Promise<void> {
        const { tagIds, isSelected } = updateTagsOrderDto

        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const promises = tagIds.map((id, tagOrder) =>
                queryRunner.manager.update(Tag, { id }, { tagOrder, isSelected : isSelected[tagOrder]  })
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


    async deleteOneTag(userId: string, todoId: string): Promise<void> {
        await this.repository.delete({
            user: { id: userId },
            id: todoId
        });
    }

    async deleteTags(userId: string, deleteTagsDto: DeleteTagsDto): Promise<void> {
        try {
            await this.repository.delete({ id: In(deleteTagsDto.tagIds), user: userId });
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
}