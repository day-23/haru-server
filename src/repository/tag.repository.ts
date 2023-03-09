import { InjectRepository } from "@nestjs/typeorm";
import { Tag } from "src/entity/tag.entity";
import { CreateTagsDto } from "src/tags/dto/create.tag.dto";
import { In, Repository } from "typeorm";


export class TagRepository {
    constructor(@InjectRepository(Tag) private readonly repository: Repository<Tag>,
    ) { }

    async createTags(userId: string, createTagDto: CreateTagsDto) {
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
}