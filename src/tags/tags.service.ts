import { Injectable } from '@nestjs/common';
import { Tag } from 'src/entity/tag.entity';
import { TagRepository } from 'src/repository/tag.repository';
import { CreateTagDto, CreateTagsDto, DeleteTagsDto, UpdateTagDto, UpdateTagsOrderDto } from './dto/create.tag.dto';
import { BaseTag } from './interface/tag.interface';

@Injectable()
export class TagsService {
    constructor(private readonly tagRepository: TagRepository) { }

    async createTag(userId: string, createTagDto: CreateTagDto) : Promise<BaseTag>{
        const {id, content, isSelected, tagOrder} =  await this.tagRepository.saveTag(userId, createTagDto);
        return {id, content, isSelected, tagOrder}
    }

    async createTags(userId: string, createTagsDto: CreateTagsDto): Promise<Tag[]> {
        // return await this.tagRepository.saveTags(userId, createTagsDto);
        return null
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

    async updateTagsOrder(userId: string, updateTagsOrderDto: UpdateTagsOrderDto): Promise<void> {
        return this.tagRepository.updateTagsOrder(userId, updateTagsOrderDto);
    }
    
    async deleteTag(userId: string, tagId:string): Promise<void> {
        return await this.tagRepository.deleteOneTag(userId, tagId);
    }

    async deleteTags(userId: string, deleteTagsDto: DeleteTagsDto):Promise<void> {
        return await this.tagRepository.deleteTags(userId, deleteTagsDto)
    }
}
