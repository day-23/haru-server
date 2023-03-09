import { Injectable } from '@nestjs/common';
import { Tag } from 'src/entity/tag.entity';
import { TagRepository } from 'src/repository/tag.repository';
import { CreateTagsDto } from './dto/create.tag.dto';

@Injectable()
export class TagsService {
    constructor(private readonly tagRepository: TagRepository) { }

    // async getAllTags(): Promise<Tag[]> {
    //     return await this.tagRepository.findAll()
    // }

    // async getTagsByPagination(userId: string, paginationDto: PaginationDto) {
    //     return await this.tagRepository.findByPagination(userId, paginationDto)
    // }

    async createTags(userId: string, createTagDto: CreateTagsDto): Promise<Tag[]> {
        return await this.tagRepository.createTags(userId, createTagDto);
    }

    // async updateTag(userId: string, TagId: string, Tag: UpdateTagDto): Promise<Tag> {
    //     return await this.tagRepository.update(userId, TagId, Tag);
    // }

    // async deleteTag(userId: string, TagId: string): Promise<void> {
    //     return await this.tagRepository.delete(userId, TagId);
    // }
}
