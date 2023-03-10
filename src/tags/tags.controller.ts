import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { swaggerTagsCreateExample } from 'src/common/swagger/tag.example';
import { swaggerTodoCreateExample } from 'src/common/swagger/todo.example';
import { Tag } from 'src/entity/tag.entity';
import { CreateTagsDto, DeleteTagsDto, UpdateTagDto } from './dto/create.tag.dto';
import { TagsService } from './tags.service';

@ApiTags('Tag API')
@Controller('tag/:userId')
export class TagsController {
    constructor(private readonly tagService: TagsService) { }

    @Post('tags')
    @ApiOperation({ summary: '태그 생성 API', description: '태그를 생성한다.' })
    @ApiBody({ type: CreateTagsDto, description: 'Request body example' })
    @ApiCreatedResponse({
        description: '태그를 생성한다. 해당 사용자가 이미 사용하는 태그를 입력하는 경우, 새로 생성하진 않음', schema: {
            example: swaggerTagsCreateExample
        }
    })
    async create(@Param('userId') userId: string, @Body() createTagDto: CreateTagsDto): Promise<Tag[]> {
        return await this.tagService.createTags(userId, createTagDto)
    }

    @Get('tags')
    @ApiOperation({ summary: '사용자의 모든 태그 조회 API' })
    async getTagsByUserId(@Param('userId') userId: string) {
        return await this.tagService.getTagsByUserId(userId)
    }

    @Patch(':tagId')
    @ApiOperation({ summary: '태그 업데이트 API' })
    async update(@Param('userId') userId: string, @Param('tagId') tagId: string, @Body() updateTagDto: UpdateTagDto): Promise<Tag> {
        return this.tagService.updateTag(userId, tagId, updateTagDto);
    }

    @Delete('tags')
    @ApiOperation({ summary: '태그 여러개 삭제 API' })
    @ApiBody({ type: DeleteTagsDto, description: 'Request body example' })
    async deleteTags(
        @Param('userId') userId: string,
        @Body() deleteTagsDto: DeleteTagsDto,
    ): Promise<void> {
        return await this.tagService.deleteTags(userId, deleteTagsDto);
    }
}
