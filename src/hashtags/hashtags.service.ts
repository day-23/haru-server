import { Inject, Injectable } from '@nestjs/common';
import { HashtagServiceInterface } from './interface/hashtag.service.interface';
import { HashtagRepositoryInterface } from './interface/hashtag.repository.interface';
import { Hashtag } from 'src/entity/hashtag.entity';
import { CreateHashTagsDto } from './dto/create.hashtag.dto';

@Injectable()
export class HashtagsService implements HashtagServiceInterface {
    constructor(
        @Inject('HashtagRepositoryInterface') private readonly hashtagRepository: HashtagRepositoryInterface
    ) { }

    async createHashtags(createHashTagsDto: CreateHashTagsDto): Promise<Hashtag[]> {
        return await this.hashtagRepository.createHashtags(createHashTagsDto);
    }
}
