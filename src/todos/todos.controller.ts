import { Controller, Get, Query } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Todo } from 'src/entity/todo.entity';
import { TodosService } from './todos.service';

@Controller('todo')
export class TodosController {
    constructor(private readonly todoService: TodosService){}

    @Get()
    async findAll(@Query() paginationDto : PaginationDto) : Promise<Todo[]>{
        const {page, limit} = paginationDto
        return await this.todoService.getAllTodosByPagination(page, limit);
    }

}
