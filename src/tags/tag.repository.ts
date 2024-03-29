import { ConflictException, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Tag } from "src/entity/tag.entity";
import { TodoTags } from "src/entity/todo-tags.entity";
import { CreateTagDto, CreateTagsDto, DeleteTagsDto, UpdateTagDto, UpdateTagsOrderDto } from "src/tags/dto/create.tag.dto";
import { BaseTag } from "src/tags/interface/tag.interface";
import { In, QueryRunner, Repository } from "typeorm";


export class TagRepository {
    constructor(@InjectRepository(Tag) private readonly repository: Repository<Tag>,
    @InjectRepository(TodoTags) private readonly todoTagsRepository: Repository<TodoTags>
    ) { }

    async saveTag(userId: string, createTagDto: CreateTagDto) : Promise<Tag> {
        const { content } = createTagDto;

        const [existingTag, nextTagOrder] = await Promise.all([
            this.repository.findOne({ where: { user: { id: userId }, content } }),
            this.findNextTagOrder(userId)
        ]) 

        if (existingTag) {
            throw new ConflictException(`Tag with this user already exists`);
        }
        const newTag = this.repository.create({ user : {id : userId}, content, tagOrder : nextTagOrder + 1})
        return await this.repository.save(newTag);
    }

    /* 태그를 한번에 여러개 생성하는 코드 */
    async saveTags(userId: string, createTagsDto: CreateTagsDto, queryRunner? : QueryRunner) : Promise<BaseTag[]> {
        const [existingTags, nextTagOrder] = await Promise.all([
            this.repository.find({ where: { user: { id: userId }, content: In(createTagsDto.contents) } }),
            this.findNextTagOrder(userId)
        ])

        const tagsRepository = queryRunner ? queryRunner.manager.getRepository(Tag) : this.repository;
        
        const newTags = createTagsDto.contents
            .filter(content => !existingTags.some(tag => tag.content.toUpperCase() === content.toUpperCase()))
            .map((content, index) => tagsRepository.create({
                user: { id: userId },
                content,
                tagOrder: nextTagOrder + index
              }));

        const createdTags = await tagsRepository.save(newTags)

        const tags = [...createdTags, ...existingTags].sort((a, b) => a.tagOrder - b.tagOrder);
        return tags.map(({ id, content, isSelected, tagOrder }) => ({
            id,
            content,
            isSelected,
            tagOrder
        }));
    }

    /* 리팩토링 필요 */
    async saveTagsOrderedByInput(userId: string, createTagsDto: CreateTagsDto, queryRunner?: QueryRunner): Promise<BaseTag[]> {
        const [existingTags, nextTagOrder] = await Promise.all([
            this.repository.find({ where: { user: { id: userId }, content: In(createTagsDto.contents) } }),
            this.findNextTagOrder(userId),
        ]);
        
        const tagsRepository = queryRunner ? queryRunner.manager.getRepository(Tag) : this.repository;
        const contents = [...new Set(createTagsDto.contents)]

        const newTags = contents
            .filter((content) => !existingTags.some((tag) => tag.content.toUpperCase() === content.toUpperCase()))
            .map((content, index) =>
                tagsRepository.create({
                    user: { id: userId },
                    content,
                    tagOrder: nextTagOrder + index,
                }),
            );
    
        const createdTags = newTags.length > 0 ? await tagsRepository.save(newTags) : [];
        
        // Create a mapping between content strings and tags
        const contentTagMap = new Map<string, BaseTag>();
        for (const tag of [...createdTags, ...existingTags]) {
            contentTagMap.set(tag.content.toUpperCase(), {
                id: tag.id,
                content: tag.content,
                isSelected: tag.isSelected,
                tagOrder: tag.tagOrder,
            });
        }
    
        // Reconstruct the tags array based on the original order of createTagsDto.contents
        const orderedTags: BaseTag[] = contents.map((content) => contentTagMap.get(content.toUpperCase()));
        return orderedTags;
    }

    async findNextTagOrder(userId: string): Promise<number> {
        const nextTagOrder = await this.repository.createQueryBuilder('tag')
            .select('MAX(tag.tagOrder)', 'maxOrder')
            .where('tag.user = :userId', { userId })
            .getRawOne()
        return nextTagOrder.maxOrder + 1;
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


    async getTodoCntByUserIdAndTagId(userId : string, tagId : string){
        // count id userId and tagId in todoTags
        const result = await this.todoTagsRepository.createQueryBuilder('todoTags')
            .select('COUNT(todoTags.todo)', 'todoCnt')
            .where('todoTags.tag = :tagId', { tagId })
            .andWhere('todoTags.user = :userId', { userId })
            .getRawOne()
        return Number(result.todoCnt)
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

    async deleteTags(userId: string, deleteTagsDto: DeleteTagsDto): Promise<void> {
        const result = await this.repository.delete({ id: In(deleteTagsDto.tagIds), user: { id: userId } });

        if (result.affected === 0) {
            throw new HttpException(
                'Tag not found',
                HttpStatus.NOT_FOUND,
            );
        }
    }
}