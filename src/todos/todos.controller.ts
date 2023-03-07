import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { swaggerTodoCreateExample } from 'src/common/swagger/example';
import { Todo } from 'src/entity/todo.entity';
import { CreateTodoDto } from './dto/create.dto';
import { TodosService } from './todos.service';


@Controller('todo')
@ApiTags('Todo API')
export class TodosController {
    constructor(private readonly todoService: TodosService) { }

    @Get()
    async findAll(@Query() paginationDto: PaginationDto){
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
