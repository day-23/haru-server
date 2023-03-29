import { Injectable } from '@nestjs/common';
import { Tag } from 'src/entity/tag.entity';
import { TagRepository } from 'src/tags/tag.repository';
import { QueryRunner } from 'typeorm';
import { CreateTagDto, CreateTagsDto, DeleteTagsDto, UpdateTagDto, UpdateTagsOrderDto } from './dto/create.tag.dto';
import { BaseTag } from './interface/tag.interface';

@Injectable()
export class TagsService {
    constructor(private readonly tagRepository: TagRepository) { }

    async createTag(userId: string, createTagDto: CreateTagDto) : Promise<BaseTag>{
        const {id, content, isSelected, tagOrder} =  await this.tagRepository.saveTag(userId, createTagDto);
        return {id, content, isSelected, tagOrder}
    }

    async createTags(userId: string, createTagsDto: CreateTagsDto, queryRunner?: QueryRunner):Promise<BaseTag[]>{
        if(createTagsDto.contents.length === 0) return [];
        
        return await this.tagRepository.saveTags(userId, createTagsDto, queryRunner);
    }

    async createTagsOrderedByInput(userId: string, createTagsDto: CreateTagsDto, queryRunner?: QueryRunner):Promise<BaseTag[]>{
        if(createTagsDto.contents.length === 0) return [];

        return await this.tagRepository.saveTagsOrderedByInput(userId, createTagsDto, queryRunner);
    }

    async updateTag(userId: string, tagId: string , updateTagDto: UpdateTagDto): Promise<BaseTag> {
        const {id, content, isSelected, tagOrder} = await this.tagRepository.updateTag(userId, tagId, updateTagDto);
        return {id, content, isSelected, tagOrder}
    }


    async getTagsByUserId(userId: string): Promise<BaseTag[]> {
        return this.tagRepository.findAllTagsByUserId(userId);
    }

    async updateTagsOrder(userId: string, updateTagsOrderDto: UpdateTagsOrderDto): Promise<void> {
        return this.tagRepository.updateTagsOrder(userId, updateTagsOrderDto);
    }

    async deleteTags(userId: string, deleteTagsDto: DeleteTagsDto):Promise<void> {
        return await this.tagRepository.deleteTags(userId, deleteTagsDto)
    }
}
