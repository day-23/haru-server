import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginatedResponse } from 'src/common/decorators/paginated-response.decorator';
import { DatePaginationDto } from 'src/common/dto/date-pagination.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { swaggerGetTodosByPagination, swaggerTodoCreateExample } from 'src/common/swagger/todo.example';
import { Todo } from 'src/entity/todo.entity';
import { CreateTodoDto, UpdateTodoDto } from './dto/create.todo.dto';
import { GetByTagDto } from './dto/geybytag.todo.dto';
import { TodosService } from './todos.service';


@Controller('todo/:userId')
@ApiTags('Todo API')
export class TodosController {
    constructor(private readonly todoService: TodosService) { }

    @PaginatedResponse()
    @Get('todos')
    @ApiOperation({ summary: '투두 페이지네이션 전체 조회 API', description: '투두를 조회한다.' })
    @ApiCreatedResponse({
        description: '투두 페이지네이션 방식으로 조회한다.', schema: {
            example: swaggerGetTodosByPagination
        }
    })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 아이템 개수 (기본값: 10)' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호 (기본값: 1)' })
    async getTodosByPagination(@Param('userId') userId, @Query() paginationDto: PaginationDto) {
        console.log('hello')
        return await this.todoService.getTodosByPagination(userId, paginationDto);
    }

    @PaginatedResponse()
    @Get('todos/date')
    @ApiOperation({ summary: '투두 날짜 파라미터로 조회 API', description: '투두를 조회한다.' })
    @ApiCreatedResponse({
        description: '투두 페이지네이션 방식으로 조회한다.', schema: {
            example: swaggerGetTodosByPagination
        }
    })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    @ApiQuery({ name: 'endDate', type: String, required: true, description: '페이지당 아이템 개수 (기본값: 10)' })
    @ApiQuery({ name: 'startDate', type: String, required: true, description: '페이지 번호 (기본값: 1)' })
    async getTodosByDate(@Param('userId') userId, @Query() datePaginationDto: DatePaginationDto) {
        console.log('hello')
        return await this.todoService.getTodosByDate(userId, datePaginationDto);
    }

    @PaginatedResponse()
    @Get('todos/tag')
    @ApiOperation({ summary: '태그 별로 투두 조회 API', description: '태그별로 투두를 조회한다.' })
    @ApiCreatedResponse({
        description: '태그 별로 투두를 페이지네이션 방식으로 조회한다.', schema: {
            example: swaggerGetTodosByPagination
        }
    })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    @ApiParam({ name: 'tagId', required: true, description: '조회하고자 하는 태그의 Id' })
    async getTodosByTag(@Param('userId') userId, @Query() getByTagDto: GetByTagDto) {
        return await this.todoService.getTodosByTag(userId, getByTagDto);
    }




    @Post()
    @ApiOperation({ summary: '투두 생성 API', description: '투두를 생성한다.' })
    @ApiCreatedResponse({
        description: '투두를 생성한다.', schema: {
            example: swaggerTodoCreateExample
        }
    })
    async create(@Param('userId') userId: string, @Body() createTodoDto: CreateTodoDto){
        console.log(createTodoDto)
        return await this.todoService.createTodo(userId, createTodoDto)
    }

    @Patch(':todoId')
    @ApiOperation({ summary: '투두 수정 API', description: '투두를 수정한다.' })
    @ApiCreatedResponse({
        description: '투두를 수정한다.', schema: {
            example: swaggerTodoCreateExample
        }
    })
    async update(@Param('userId') userId: string,
        @Param('todoId') todoId: string,
        @Body() todo: UpdateTodoDto): Promise<Todo> {
        return this.todoService.updateTodo(userId, todoId, todo);
    }

    @Delete(':todoId')
    @ApiOperation({ summary: '투두 삭제 API', description: '투두를 삭제한다.' })
    @ApiCreatedResponse({
        description: '투두를 삭제한다.', schema: {
            example: swaggerTodoCreateExample
        }
    })
    async delete(@Param('userId') userId: string,
        @Param('todoId') todoId: string): Promise<void> {
        return this.todoService.deleteTodo(userId, todoId);
    }



}
