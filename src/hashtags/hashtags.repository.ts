import { Hashtag } from "src/entity/hashtag.entity";
import { HashtagRepositoryInterface } from "./interface/hashtag.repository.interface";
import { In, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateHashTagsDto } from "./dto/create.hashtag.dto";


export class HashtagRepository implements HashtagRepositoryInterface {
    constructor(@InjectRepository(Hashtag) private readonly repository: Repository<Hashtag>,
    ) { }

    async createHashtags(createHashTagsDto: CreateHashTagsDto): Promise<Hashtag[]> {
        let { contents } = createHashTagsDto
        if (contents === undefined || contents === null || contents.length === 0) return []

        if (typeof contents === 'string') {
            contents = [contents];
        }

        const existingHashTags = await this.repository.find({ where: { content: In(contents) } })
        
        const newTags = contents
            .filter(content => !existingHashTags.some(tag => tag.content === content))
            .map((content) => this.repository.create({ content }));
        const createdTags = await this.repository.save(newTags)
        
        return [...createdTags, ...existingHashTags]
    }
}