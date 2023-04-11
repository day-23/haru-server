import { Hashtag } from "src/entity/hashtag.entity";
import { HashtagRepositoryInterface } from "./interface/hashtag.repository.interface";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateHashTagsDto } from "./dto/create.hashtag.dto";


export class HashtagRepository implements HashtagRepositoryInterface {
    constructor(@InjectRepository(Hashtag) private readonly repository: Repository<Hashtag>,
    ) { }

    async createHashtags(createHashTagsDto: CreateHashTagsDto): Promise<Hashtag[]> {
        const { contents } = createHashTagsDto
        const hashtagsArray = contents.map((hashtag) => {
            return { content: hashtag }
        })
        return await this.repository.save(hashtagsArray) 
    }
}