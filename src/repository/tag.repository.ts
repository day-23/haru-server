import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Tag } from "src/entity/tag.entity";
import { CreateTagsDto, DeleteTagsDto, UpdateTagDto } from "src/tags/dto/create.tag.dto";
import { In, Repository } from "typeorm";


export class TagRepository {
    constructor(@InjectRepository(Tag) private readonly repository: Repository<Tag>,
    ) { }


    /* 태그를 한번에 여러개 생성하는 코드 */
    async saveTags(userId: string, createTagDto: CreateTagsDto) {
        // 필요없을 것 같음 -> const user = await this.userService.findOne(userId);
        const existingTags = await this.repository.find({
            where: {
                user: { id: userId },
                content: In(createTagDto.contents)
            }
        });

        const newTags = createTagDto.contents
            .filter(content => !existingTags.some(tag => tag.content === content))
            .map(content => {
                const newTag = new Tag({
                    user: userId,
                    content
                });
                return newTag;
            });

        const createdTags = await this.repository.save(newTags);

        return [...createdTags, ...existingTags];
    }

    async findAllTagsByUserId(userId: string): Promise<Tag[]> {
        return await this.repository.createQueryBuilder('tag')
                .select(['tag.id', 'tag.content', 'tag.user'])
                .where('tag.user.id = :userId', { userId })
                .getMany()
    }

    async findTagById(tagId: string): Promise<Tag> {
        return this.repository.findOne({ where: { id: tagId }});
    }

    async updateTag(userId: string, tagId: string, updateTagDto: UpdateTagDto): Promise<Tag> {
        const existingTag = await this.findTagById(tagId);
        if (!existingTag) {
            throw new HttpException(
                'Tag not found',
                HttpStatus.NOT_FOUND,
            );
        }

        // Add validation to check that the user ID of the tag matches the user ID passed as a parameter
        /* user validation 추가 필요 */
        // console.log('DEBUG', existingTag)
        // if (existingTag.user !== userId) {
        //     throw new HttpException(
        //         'Unauthorized',
        //         HttpStatus.UNAUTHORIZED,
        //     );
        // }

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

    async deleteOneTag(userId: string, todoId: string): Promise<void> {
        await this.repository.delete({
            user: { id: userId },
            id: todoId
        });
    }

    async deleteTags(userId: string, deleteTagsDto: DeleteTagsDto): Promise<void> {
        try{
            await this.repository.delete({ id: In(deleteTagsDto.tagIds), user:userId });
        }catch (error) {
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