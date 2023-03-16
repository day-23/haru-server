import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginatedResponse } from 'src/common/decorators/paginated-response.decorator';
import { DatePaginationDto } from 'src/common/dto/date-pagination.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { swaggerGetTodosByPagination, swaggerTodoCreateExample } from 'src/common/swagger/todo.example';
import { Todo } from 'src/entity/todo.entity';
import { CreateTagDto } from 'src/tags/dto/create.tag.dto';
import { CreateSubTodoDto } from './dto/create.subtodo.dto';
import { CreateAlarmByTimeDto, CreateTodoDto, UpdateTodoDto } from './dto/create.todo.dto';
import { GetByTagDto } from './dto/geybytag.todo.dto';
import { UpdateSubTodosOrderDto, UpdateTodosInTagOrderDto, UpdateTodosOrderDto } from './dto/order.todo.dto';
import { GetTodoResponse } from './interface/todo.interface';
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
    @ApiQuery({ name: 'endDate', type: String, required: true, description: '마지막 날짜' })
    @ApiQuery({ name: 'startDate', type: String, required: true, description: '시작 날짜' })
    async getTodosByDate(@Param('userId') userId, @Query() datePaginationDto: DatePaginationDto) {
        console.log('hello')
        return await this.todoService.getTodosByDate(userId, datePaginationDto);
    }

    @PaginatedResponse()
    @Get('todos/tag')
    @ApiOperation({ summary: '태그 별로 투두 조회 API', description: '태그별로 투두를 조회한다.' })
    @ApiCreatedResponse({
        description: '태그 별로 투두를 페이지네이션 방식으로 조회한다.'
    })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    @ApiQuery({ name: 'tagId', required: true, description: '조회하고자 하는 태그의 Id' })
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
    async create(@Param('userId') userId: string, @Body() createTodoDto: CreateTodoDto) : Promise<GetTodoResponse>  {
        console.log(createTodoDto)
        return await this.todoService.createTodo(userId, createTodoDto)
    }

    @Post(':todoId/alarm')
    @ApiOperation({ summary: '이미 생성된 투두에 알람을 추가하는 API', description: '투두에 알람을 추가한다.' })
    @ApiCreatedResponse({
        description: '이미 생성되어있는 투두에 알람을 추가한다.'
    })
    async addAlarmToTodo(@Param('userId') userId: string, @Param('todoId') todoId: string,
            @Body() createAlarmByTimeDto:CreateAlarmByTimeDto) {
        return await this.todoService.createAlarmToTodo(userId, todoId, createAlarmByTimeDto)
    }

    @Post(':todoId/tag')
    @ApiOperation({ summary: '이미 생성된 투두에 태그를 추가하는 API ', description: '투두에 태그를 추가한다.' })
    @ApiCreatedResponse({
        description: '이미 생성되어있는 투두에 태그를 추가한다.'
    })
    async addTagToTodo(@Param('userId') userId: string, @Param('todoId') todoId: string, @Body() createTagDto:CreateTagDto) {
        return await this.todoService.createTagToTodo(userId, todoId, createTagDto)
    }

    @Post(':todoId/subtodo')
    @ApiOperation({ summary: '이미 생성된 투두에 하위항목을 추가하는 API / 구현중', description: '투두에 하위항목을 추가한다.' })
    @ApiCreatedResponse({
        description: '이미 생성되어있는 투두에 하위항목을 추가한다.'
    })
    async addSubTodoToTodo(@Param('userId') userId: string, @Param('todoId') todoId: string, @Body() createSubTodoDto : CreateSubTodoDto) {
        return await this.todoService.createSubTodoToTodo(userId, todoId, createSubTodoDto)
    }

    @Patch(':todoId')
    @ApiOperation({ summary: '투두 본체 내용 수정 API', description: '투두를 수정한다.' })
    @ApiCreatedResponse({
        description: '투두를 수정한다.'
    })
    async update(@Param('userId') userId: string,
        @Param('todoId') todoId: string,
        @Body() todo: UpdateTodoDto): Promise<Todo> {
        return this.todoService.updateTodo(userId, todoId, todo);
    }

    @Delete(':todoId')
    @ApiOperation({ summary: '투두 삭제 API', description: '투두를 삭제한다.' })
    @ApiCreatedResponse({
        description: '투두를 삭제한다.'
    })
    async delete(@Param('userId') userId: string,
        @Param('todoId') todoId: string): Promise<void> {
        return this.todoService.deleteTodo(userId, todoId);
    }


    @Delete(':todoId/tag/:tagId')
    @ApiOperation({ summary: '투두의 태그를 삭제하는 API', description: '투두의 태그를 삭제한다.' })
    @ApiCreatedResponse({
        description: '투두를 삭제한다.'
    })
    async deleteTagOfTodo(@Param('userId') userId: string,
        @Param('todoId') todoId: string, @Param('tagId') tagId: string): Promise<void> {
        return this.todoService.deleteTagOfTodo(userId, todoId, tagId);
    }

    @Delete(':todoId/subtodo/:subTodoId')
    @ApiOperation({ summary: '투두의 서브 투두를 삭제하는 API -단일 투두에 대한 서브투두 지우기는 구현함, 반복된 서브투두에 대해 추가구현 필요', description: '투두의 서브 투두를 삭제한다.' })
    @ApiCreatedResponse({
        description: '투두의 태그를 삭제한다.'
    })
    async deleteSubTodoOfTodo(@Param('userId') userId: string,
        @Param('todoId') todoId: string, @Param('subTodoId') subTodoId: string): Promise<void> {
        return this.todoService.deleteSubTodoOfTodo(userId, todoId, subTodoId);
    }


    @Get('search')
    @ApiOperation({ summary: '투두 검색 API', description: '투두를 검색한다.' })
    async searchTodos(
        @Param('userId') userId : string,
        @Query('content') content : string,
    ){
        return this.todoService.getTodosBySearch(userId, content)
    }


    @Patch('order/todos')
    @ApiOperation({summary: '투두 메인화면 정렬 API', description : '메인 화면에서 드래그앤드랍시 투두를 정렬한다.'})
    async orderTodos(
        @Param('userId') userId : string,
        @Body() updateTodosOrderDto : UpdateTodosOrderDto
    ){
        return this.todoService.updateTodosOrder(userId, updateTodosOrderDto)
    }

    @Patch('order/todos/tag')
    @ApiOperation({summary: '투두 태그화면 정렬 API / 구현중', description : '태그 화면에서 드래그앤드랍시 투두를 정렬한다.'})
    async orderTodosInTag(
        @Param('userId') userId : string,
        @Body() updateTodosOrderDto : UpdateTodosInTagOrderDto
    ){
        return this.todoService.updateTodosOrderInTag(userId, updateTodosOrderDto)
    }

    @Patch('order/subtodos')
    @ApiOperation({summary: '하위항목 정렬 API / 구현중', description : '드래그앤드랍시 하위항목을 정렬한다.'})
    async orderSubTodos(
        @Param('userId') userId : string,
        @Body() updateTodosOrderDto : UpdateSubTodosOrderDto
    ){
        return this.todoService.updateSubTodosOrder(userId, updateTodosOrderDto)
    }

}
