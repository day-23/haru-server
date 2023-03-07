import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginatedResponse } from 'src/common/decorators/paginated-response.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { swaggerGetTodosByPagination, swaggerTodoCreateExample } from 'src/common/swagger/todo.example';
import { Todo } from 'src/entity/todo.entity';
import { CreateTodoDto } from './dto/create.dto';
import { TodosService } from './todos.service';


@Controller('todo')
@ApiTags('Todo API')
export class TodosController {
    constructor(private readonly todoService: TodosService) { }

    @PaginatedResponse()
    @Get()
    @ApiOperation({ summary: '투두 조회 API', description: '투두를 조회한다.' })
    @ApiCreatedResponse({
        description: '투두 페이지네이션 방식으로 조회한다.', schema: {
            example: swaggerGetTodosByPagination
        }
    })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 아이템 개수 (기본값: 10)' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호 (기본값: 1)' })
    async getTodosByPagination(@Query() paginationDto: PaginationDto){
        console.log('hello')
        const { page, limit } = paginationDto
        return await this.todoService.getTodosByPagination(page, limit);
    }

    @Post()
    @ApiOperation({ summary: '투두 생성 API', description: '투두를 생성한다.' })
    @ApiCreatedResponse({
        description: '투두를 생성한다.', schema: {
            example: swaggerTodoCreateExample
        }
    })
    async create(@Body() createTodoDto: CreateTodoDto): Promise<Todo> {
        console.log(createTodoDto)
        return await this.todoService.createTodo(createTodoDto)
    }





}
