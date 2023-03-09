import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { swaggerTagsCreateExample } from 'src/common/swagger/tag.example';
import { swaggerTodoCreateExample } from 'src/common/swagger/todo.example';
import { Tag } from 'src/entity/tag.entity';
import { CreateTagsDto } from './dto/create.tag.dto';
import { TagsService } from './tags.service';

@ApiTags('Tag API')
@Controller('tags/:userId')
export class TagsController {
    constructor(private readonly tagService: TagsService) { }

    @Post()
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

    

}
