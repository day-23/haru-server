import { Injectable } from '@nestjs/common';
import { Tag } from 'src/entity/tag.entity';
import { TagRepository } from 'src/repository/tag.repository';
import { CreateTagDto, CreateTagsDto, DeleteTagsDto, UpdateTagDto } from './dto/create.tag.dto';
import { BaseTag } from './interface/tag.interface';

@Injectable()
export class TagsService {
    constructor(private readonly tagRepository: TagRepository) { }

    async createTag(userId: string, createTagDto: CreateTagDto){
        return await this.tagRepository.saveTag(userId, createTagDto);
    }

    async createTags(userId: string, createTagsDto: CreateTagsDto): Promise<Tag[]> {
        return await this.tagRepository.saveTags(userId, createTagsDto);
    }

    async getTagsByUserId(userId: string): Promise<BaseTag[]> {
        return this.tagRepository.findAllTagsByUserId(userId);
    }

    // async getOneTag(tagId: string): Promise<Tag> {
    //     return this.tagRepository.findOne(tagId);
    // }

    async updateTag(userId: string, tagId: string , updateTagDto: UpdateTagDto): Promise<Tag> {
        return this.tagRepository.updateTag(userId, tagId, updateTagDto);
    }

    async deleteTag(userId: string, tagId:string): Promise<void> {
        return await this.tagRepository.deleteOneTag(userId, tagId);
    }

    async deleteTags(userId: string, deleteTagsDto: DeleteTagsDto):Promise<void> {
        return await this.tagRepository.deleteTags(userId, deleteTagsDto)
    }
}
