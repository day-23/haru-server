import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Todo } from 'src/entity/todo.entity';
import { CreateTodoDto } from './dto/create.dto';
import { TodosService } from './todos.service';

@Controller('todo')
export class TodosController {
    constructor(private readonly todoService: TodosService){}

    @Get()
    async findAll(@Query() paginationDto : PaginationDto) : Promise<Todo[]>{
        const {page, limit} = paginationDto
        return await this.todoService.getAllTodosByPagination(page, limit);
    }

    @Post()
    async create(@Body() createTodoDto: CreateTodoDto): Promise<Todo> {
        console.log(createTodoDto)
        return await this.todoService.createTodo(createTodoDto)
    }





}
