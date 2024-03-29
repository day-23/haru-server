import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTagDto, CreateTagsDto, DeleteTagsDto, UpdateTagDto, UpdateTagsOrderDto } from './dto/create.tag.dto';
import { BaseTag } from './interface/tag.interface';
import { TagsService } from './tags.service';

@ApiTags('Tag API')
@Controller('tag/:userId')
export class TagsController {
    constructor(private readonly tagService: TagsService) { }

    @Post('tag')
    @ApiOperation({ summary: '태그 한개 생성 API', description: '태그를 한개 생성한다.' })
    async createTag(@Param('userId') userId: string, @Body() createTagDto: CreateTagDto): Promise<BaseTag>{
        return await this.tagService.createTag(userId, createTagDto)
    }

    @Post('tags')
    @ApiOperation({ summary: '태그 여러개 생성 API', description: '태그를 여러개 생성한다.' })
    async createTags(@Param('userId') userId: string, @Body() createTagDto: CreateTagsDto): Promise<BaseTag[]>{
        return await this.tagService.createTags(userId, createTagDto)
    }

    @Get('tags')
    @ApiOperation({ summary: '사용자의 모든 태그 조회 API' })
    async getTagsByUserId(@Param('userId') userId: string) : Promise<BaseTag[]> {
        return await this.tagService.getTagsByUserId(userId)
    }

    @Get(':tagId/todoCnt')
    @ApiOperation({ summary: '사용자의 모든 태그 조회 API' })
    async getTodoCntByUserIdAndTagId(@Param('userId') userId: string, @Param('tagId') tagId: string) {
        return await this.tagService.getTodoCntByUserIdAndTagId(userId, tagId)
    }

    @Patch('order')
    @ApiOperation({ summary: '태그 순서 업데이트 API' })
    async updateTagsOrder(@Param('userId') userId: string, @Body() updateTagsOrderDto: UpdateTagsOrderDto): Promise<void> {
        return await this.tagService.updateTagsOrder(userId, updateTagsOrderDto);
    }

    @Patch(':tagId')
    @ApiOperation({ summary: '태그 업데이트 API' })
    async update(@Param('userId') userId: string, @Param('tagId') tagId: string, @Body() updateTagDto: UpdateTagDto): Promise<BaseTag> {
        return this.tagService.updateTag(userId, tagId, updateTagDto);
    }

    @Delete('tags')
    @ApiOperation({ summary: '태그 여러개 삭제 API' })
    async deleteTags(@Param('userId') userId: string, @Body() deleteTagsDto: DeleteTagsDto): Promise<void> {
        return await this.tagService.deleteTags(userId, deleteTagsDto);
    }
}
