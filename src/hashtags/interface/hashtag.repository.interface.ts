import { Hashtag } from "src/entity/hashtag.entity";
import { CreateHashTagsDto } from "../dto/create.hashtag.dto";

export interface HashtagRepositoryInterface {
    createHashtags(createHashTagsDto: CreateHashTagsDto): Promise<Hashtag[]>;
}