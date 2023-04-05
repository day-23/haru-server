import { Body, Controller, Delete, ForbiddenException, Get, Inject, Param, Patch, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginatedResponse } from 'src/common/decorators/paginated-response.decorator';
import { DatePaginationDto, DateTimePaginationDto, TodayTodoDto } from 'src/common/dto/date-pagination.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { NotRepeatTodoCompleteDto, RepeatTodoCompleteBackBySplitDto, RepeatTodoCompleteBySplitDto, RepeatTodoCompleteMiddleBySplitDto } from './dto/complete.todo.dto';
import { UpdateSubTodoDto } from './dto/create.subtodo.dto';
import { BaseTodoDto, CreateTodoDto, UpdateTodoDto } from './dto/create.todo.dto';
import { GetByTagDto } from './dto/geybytag.todo.dto';
import { UpdateSubTodosOrderDto, UpdateTodosInTagOrderDto, UpdateTodosOrderDto } from './dto/order.todo.dto';
import { GetTodosPaginationResponse, GetTodosResponseByTag, GetTodosResponseByDate, GetTodosForMain, TodoResponse, GetTodayTodosResponse, GetAllTodosResponse } from './interface/todo.return.interface';
import { TodosServiceInterface } from './interface/todo.service.interface';


@Controller('todo/:userId')
@ApiTags('Todo API')
export class TodosController {
    constructor(@Inject('TodosServiceInterface') private readonly todoService: TodosServiceInterface) {}
    
    @PaginatedResponse()
    @Post('todos/all')
    @ApiOperation({ summary: '전체 투두, endDate 날짜 파라미터로 조회 API', description: '오늘의 투두를 조회한다.' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    async getTodosAllByToday(@Param('userId') userId, @Body() todayTodoDto: TodayTodoDto): Promise<GetAllTodosResponse> {
        return await this.todoService.getAllTodos(userId, todayTodoDto);
    }

    @PaginatedResponse()
    @Get('todos/main')
    @ApiOperation({ summary: '투두 메인 데이터 조회', description: '투두 메인 데이터 조회한다.' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    async getTodosForMain(@Param('userId') userId : string): Promise<GetTodosForMain> {
        return await this.todoService.getTodosForMain(userId);
    }

    @PaginatedResponse()
    @Post('todos/today')
    @ApiOperation({ summary: '오늘의 투두, endDate 날짜 파라미터로 조회 API', description: '오늘의 투두를 조회한다.' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    async getTodayTodos(@Param('userId') userId, @Body() todayTodoDto: TodayTodoDto) : Promise<GetTodayTodosResponse> {
        return await this.todoService.getTodayTodos(userId, todayTodoDto);
    }

    @Get('todos/main/flag')
    @ApiOperation({ summary: '투두 메인 데이터에서 중요한 투두만 조회', description: '투두 메인 데이터 조회한다.' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    async getFlaggedTodosForMain(@Param('userId') userId : string): Promise<TodoResponse[]> {
        return await this.todoService.getFlaggedTodosForMain(userId);
    }

    @Get('todos/main/tag')
    @ApiOperation({ summary: '투두 메인 데이터에서 태그가 달린 데이터만 조회', description: '투두 메인 데이터 조회한다.' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    async getTaggedTodosForMain(@Param('userId') userId : string): Promise<TodoResponse[]> {
        return await this.todoService.getTaggedTodosForMain(userId);
    }

    @Get('todos/main/untag')
    @ApiOperation({ summary: '투두 메인 데이터에서 태그가 없는 데이터만 조회', description: '투두 메인 데이터 조회한다.' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    async getUnTaggedTodosForMain(@Param('userId') userId : string): Promise<TodoResponse[]> {
        return await this.todoService.getUnTaggedTodosForMain(userId);
    }

    @Get('todos/main/completed')
    @ApiOperation({ summary: '투두 메인 데이터에서 완료된 투두만 조회', description: '투두 메인 데이터 조회한다.' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    async getCompletedTodosForMain(@Param('userId') userId : string): Promise<TodoResponse[]> {
        return await this.todoService.getCompletedTodosForMain(userId);
    }

    @PaginatedResponse()
    @Get('todos')
    @ApiOperation({ summary: '투두 페이지네이션 전체 조회 API', description: '투두를 조회한다.' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 아이템 개수 (기본값: 10)' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호 (기본값: 1)' })
    async getTodosByPagination(@Param('userId') userId, @Query() paginationDto: PaginationDto): Promise<GetTodosPaginationResponse> {
        return await this.todoService.getTodosByPagination(userId, paginationDto);
    }
    

    @PaginatedResponse()
    @Get('todos/completed')
    @ApiOperation({ summary: '완료된 투두 페이지네이션 전체 조회 API', description: '투두를 조회한다.' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 아이템 개수 (기본값: 10)' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호 (기본값: 1)' })
    async getCompletedTodosByPagination(@Param('userId') userId, @Query() paginationDto: PaginationDto): Promise<GetTodosPaginationResponse> {
        return await this.todoService.getCompletedTodosByPagination(userId, paginationDto);
    }


    @PaginatedResponse()
    @Get('todos/date')
    @ApiOperation({ summary: '투두 startDate, endDate 조회 API', description: '투두를 조회한다.' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    @ApiQuery({ name: 'endDate', type: String, required: true, description: '마지막 날짜' })
    @ApiQuery({ name: 'startDate', type: String, required: true, description: '시작 날짜' })
    async getTodosByDate(@Param('userId') userId, @Query() datePaginationDto: DatePaginationDto) : Promise<GetTodosResponseByDate> {
        return await this.todoService.getTodosByDate(userId, datePaginationDto);
    }

    @PaginatedResponse()
    @Post('todos/date')
    @ApiOperation({ summary: '투두 startDate, endDate 조회 API', description: '투두를 조회한다.' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    async getTodosByDateTime(@Param('userId') userId : string, @Body() dateTimePaginationDto: DateTimePaginationDto) {
        return await this.todoService.getTodosByDateTime(userId, dateTimePaginationDto);
    }


    @PaginatedResponse()
    @Get('todos/tag')
    @ApiOperation({ summary: '태그 별로 투두 조회 API', description: '태그별로 투두를 조회한다.' })
    @ApiParam({ name: 'userId', required: true, description: '조회하고자 하는 사용자의 id' })
    @ApiQuery({ name: 'tagId', required: true, description: '조회하고자 하는 태그의 Id' })
    async getTodosByTag(@Param('userId') userId, @Query() getByTagDto: GetByTagDto): Promise<GetTodosResponseByTag> {
        return await this.todoService.getTodosByTag(userId, getByTagDto);
    }

    @Get('search')
    @ApiOperation({ summary: '투두 검색 API', description: '투두를 검색한다.' })
    async searchTodos(@Param('userId') userId: string, @Query('content') content: string): Promise<TodoResponse[]> {
        return this.todoService.getTodosBySearch(userId, content)
    }

    @Post()
    @ApiOperation({ summary: '투두 생성 API', description: '투두를 생성한다.' })
    async create(@Param('userId') userId: string, @Body() createTodoDto: CreateTodoDto): Promise<TodoResponse> {
        console.log(createTodoDto)
        return await this.todoService.createTodo(userId, createTodoDto)
    }

    @Put(':todoId')
    @ApiOperation({ summary: '투두 본체 내용 수정 API', description: '투두를 수정한다.' })
    async update(@Param('userId') userId: string,
        @Param('todoId') todoId: string,
        @Body() updateTodoDto: UpdateTodoDto) {
        return this.todoService.updateTodo(userId, todoId, updateTodoDto);
    }

    @Patch('flag/:todoId')
    @ApiOperation({ summary: '투두 flag 업데이트', description: '투두의 flag만 변경한다.' })
    async updateTodoFlag(
        @Param('userId') userId: string,
        @Param('todoId') todoId: string,
        @Body() updateTodoDto: Partial<BaseTodoDto>
    ) {
        return this.todoService.updateTodoFlag(userId, todoId, updateTodoDto.flag)
    }

    @Patch('folded/:todoId')
    @ApiOperation({ summary: '투두 folded 업데이트', description: '투두의 folded만 변경한다.' })
    async updateTodoFolded(
        @Param('userId') userId: string,
        @Param('todoId') todoId: string,
        @Body() updateTodoDto: Partial<BaseTodoDto>
    ) {
        return this.todoService.updateTodoFolded(userId, todoId, updateTodoDto.folded)
    }

    @Patch('order/todos')
    @ApiOperation({ summary: '투두 메인화면 정렬 API', description: '메인 화면에서 드래그앤드랍시 투두를 정렬한다.' })
    async orderTodos(
        @Param('userId') userId: string,
        @Body() updateTodosOrderDto: UpdateTodosOrderDto
    ) {
        return this.todoService.updateTodosOrder(userId, updateTodosOrderDto)
    }

    @Patch('order/todos/today')
    @ApiOperation({ summary: '투두 메인화면 정렬 API', description: '메인 화면에서 드래그앤드랍시 투두를 정렬한다.' })
    async orderTodayTodos(
        @Param('userId') userId: string,
        @Body() updateTodosOrderDto: UpdateTodosOrderDto
    ) {
        return this.todoService.updateTodayTodosOrder(userId, updateTodosOrderDto)
    }

    @Patch('order/todos/tag')
    @ApiOperation({ summary: '투두 태그화면 정렬 API', description: '태그 화면에서 드래그앤드랍시 투두를 정렬한다.' })
    async orderTodosInTag(
        @Param('userId') userId: string,
        @Body() updateTodosOrderDto: UpdateTodosInTagOrderDto
    ) {
        return this.todoService.updateTodosOrderInTag(userId, updateTodosOrderDto)
    }

    @Patch('order/subtodos')
    @ApiOperation({ summary: '하위항목 정렬 API', description: '드래그앤드랍시 하위항목을 정렬한다.' })
    async orderSubTodos(
        @Param('userId') userId: string,
        @Body() updateTodosOrderDto: UpdateSubTodosOrderDto
    ) {
        return this.todoService.updateSubTodosOrder(userId, updateTodosOrderDto)
    }


    @Patch('subTodo/:subTodoId')
    @ApiOperation({ summary: '하위항목 정렬 API', description: '드래그앤드랍시 하위항목을 정렬한다.' })
    async updateSubTodo(
        @Param('userId') userId: string,
        @Param('subTodoId') subTodoId: string,
        @Body() updateSubTodoDto: UpdateSubTodoDto
    ) {
        return this.todoService.updateSubTodo(userId, subTodoId ,updateSubTodoDto)
    }

    /* 투두 완료 */
    @Patch('complete/todo/:todoId')
    @ApiOperation({summary: '미반복 투두 완료/완료 취소 API', description: '투두를 완료한다, 하위항목도 모두 완료/취소 처리'})
    async completeTodo(@Param('userId') userId : string, @Param('todoId') todoId : string, @Body() notRepeatTodoCompleteDto: NotRepeatTodoCompleteDto) : Promise<void>{
        return this.todoService.updateUnRepeatTodoToComplete(userId, todoId, notRepeatTodoCompleteDto)
    }

    @Patch('complete/subtodo/:subTodoId')
    @ApiOperation({ summary: '서브 투두 완료 API(서브투두는 반복 구분 안해도됨)', description: '서브 투두를 완료한다' })
    async completeSubTodo(@Param('userId') userId: string, @Param('subTodoId') subTodoId: string, @Body() notRepeatTodoCompleteDto: NotRepeatTodoCompleteDto) {
        return this.todoService.updateSubTodo(userId, subTodoId, notRepeatTodoCompleteDto)
    }

    @Patch('complete/todo/:todoId/repeat/front')
    @ApiOperation({ summary: '반복되는 투두 중 중간 하나 완료하여 split함', description: '투두를 완료한다.' })
    async updateRepeatTodoToComplete(@Param('userId') userId: string,
        @Param('todoId') todoId : string,
        @Body() repeatTodoCompleteBySplitDto: RepeatTodoCompleteBySplitDto){
        return this.todoService.updateRepeatTodoToCompleteFront(userId, todoId, repeatTodoCompleteBySplitDto);
    }

    @Patch('complete/todo/:todoId/repeat/middle')
    @ApiOperation({ summary: '반복되는 투두 중 중간 하나 완료하여 split함', description: '투두를 완료한다.' })
    async updateRepeatTodoToCompleteMiddle(@Param('userId') userId: string,
        @Param('todoId') todoId : string,
        @Body() repeatTodoCompleteMiddleBySplitDto: RepeatTodoCompleteMiddleBySplitDto){
        return this.todoService.updateRepeatTodoToCompleteMiddle(userId, todoId, repeatTodoCompleteMiddleBySplitDto);
    }

    @Patch('complete/todo/:todoId/repeat/back')
    @ApiOperation({ summary: '반복되는 투두 중 중간 하나 완료하여 split함', description: '투두를 완료한다.' })
    async updateRepeatTodoToCompleteBack(@Param('userId') userId: string,
        @Param('todoId') todoId : string,
        @Body() repeatTodoCompleteBySplitDto: RepeatTodoCompleteBackBySplitDto){
        return this.todoService.updateRepeatTodoToCompleteBack(userId, todoId, repeatTodoCompleteBySplitDto);
    }

    @Delete(':todoId')
    @ApiOperation({ summary: '투두 삭제 API', description: '투두를 삭제한다.' })
    async delete(@Param('userId') userId: string,
        @Param('todoId') todoId: string): Promise<void> {
        return this.todoService.deleteTodo(userId, todoId);
    }

    @Delete(':todoId/subtodo/:subTodoId')
    @ApiOperation({ summary: '투두의 서브 투두를 삭제하는 API', description: '투두의 서브 투두를 삭제한다.' })
    async deleteSubTodoOfTodo(@Param('userId') userId: string,
        @Param('todoId') todoId: string, @Param('subTodoId') subTodoId: string): Promise<void> {
        return this.todoService.deleteSubTodoOfTodo(userId, todoId, subTodoId);
    }

}
