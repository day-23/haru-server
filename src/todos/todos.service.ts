import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatePaginationDto, TodayTodoDto } from 'src/common/dto/date-pagination.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ScheduleService } from 'src/schedules/schedules.service';
import { TagsService } from 'src/tags/tags.service';
import { TodoRepository } from 'src/todos/todo.repository';
import { DataSource, QueryRunner } from 'typeorm';
import { NotRepeatTodoCompleteDto } from './dto/complete.todo.dto';
import { CreateSubTodoDto, UpdateSubTodoDto } from './dto/create.subtodo.dto';
import { CreateBaseTodoDto, CreateTodoDto, UpdateTodoDto } from './dto/create.todo.dto';
import { GetByTagDto } from './dto/geybytag.todo.dto';
import { UpdateSubTodosOrderDto, UpdateTodosInTagOrderDto, UpdateTodosOrderDto } from './dto/order.todo.dto';
import { GetTodosPaginationResponse, GetTodosResponseByTag, GetTodosForMain, TodoResponse, GetTodayTodosResponse } from './interface/todo.interface';
import { parseTodoResponse } from './todo.util';

@Injectable()
export class TodosService {
    constructor(private readonly todoRepository: TodoRepository,
        private readonly scheduleService: ScheduleService,
        private readonly tagService: TagsService,
        private dataSource: DataSource
        ) { }


    async createTodo(userId: string, createTodoDto: CreateTodoDto, queryRunner?: QueryRunner): Promise<TodoResponse> {
        const { todayTodo, flag, tags, subTodos, endDate, ...createScheduleDto } = createTodoDto

        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();

        try {
            // Start the transaction
            await queryRunner.startTransaction();
            const savedSchedule = await this.scheduleService.createSchedule(userId, { ...createScheduleDto, repeatStart: endDate, categoryId: null }, queryRunner);
            const savedTodo = await this.todoRepository.createTodo(userId, savedSchedule.id, { todayTodo, flag }, queryRunner);

            const savedTags = await this.tagService.createTagsOrderedByInput(userId, { contents: tags }, queryRunner);
            await this.todoRepository.createTodoTags(savedTodo.id, savedTags.map(tag => tag.id), queryRunner);
            
            const savedSubTodos =  await this.todoRepository.createSubTodos(savedTodo.id, subTodos, queryRunner);

            await queryRunner.commitTransaction();
            return parseTodoResponse(savedSchedule, savedTodo, savedTags, savedSubTodos);            
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new HttpException(
                {
                    message: 'SQL error',
                    error: error.sqlMessage,
                },
                HttpStatus.FORBIDDEN,
            );
        } finally {
            // Release the query runner if it was created in this function
            if (shouldReleaseQueryRunner) {
                await queryRunner.release();
            }
        }
    }

    async updateTodo(userId: string, todoId: string, updateTodoDto: UpdateTodoDto, queryRunner?: QueryRunner) {
        //get existing todo by todoId
        const existingTodo = await this.todoRepository.findTodoWithScheduleIdByTodoId(todoId);
        if(!existingTodo) throw new HttpException({message: 'Todo not found',},HttpStatus.NOT_FOUND);

        const {schedule} = existingTodo
        const { id: scheduleId } = schedule
        const { todayTodo, flag, tags, subTodos, subTodosCompleted, endDate , ...createScheduleDto } = updateTodoDto

        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();

        try {
            // Start the transaction
            await queryRunner.startTransaction();
            const updatedSchedule = await this.scheduleService.updateSchedule(userId, scheduleId, { ...createScheduleDto, repeatStart: endDate, categoryId: null }, queryRunner);
            const updatedTodo = await this.todoRepository.updateTodo(userId, todoId, { todayTodo, flag }, queryRunner);
            const updatedTags = await this.tagService.createTagsOrderedByInput(userId, { contents: tags }, queryRunner);
            await this.todoRepository.updateTodoTags(todoId, updatedTags.map(tag => tag.id), queryRunner);

            const updatedSubTodos = await this.todoRepository.updateSubTodos(todoId, {contents : subTodos, subTodosCompleted }, queryRunner);

            await queryRunner.commitTransaction();
            return parseTodoResponse(updatedSchedule, updatedTodo, updatedTags, updatedSubTodos);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new HttpException(
                {
                    message: 'SQL error',
                    error: error.sqlMessage,
                },
                HttpStatus.FORBIDDEN,
            );
        } finally {
            // Release the query runner if it was created in this function
            if (shouldReleaseQueryRunner) {
                await queryRunner.release();
            }
        }
    }
    
    async getTodosForMain(userId : string): Promise<GetTodosForMain> {
        return await this.todoRepository.findTodosForMain(userId);
    }

    async getFlaggedTodosForMain(userId : string): Promise<TodoResponse[]> {
        return await this.todoRepository.getFlaggedTodosForMain(userId);
    }

    async getTaggedTodosForMain(userId : string): Promise<TodoResponse[]> {
        return await this.todoRepository.getTaggedTodosForMain(userId);
    }

    async getUnTaggedTodosForMain(userId : string): Promise<TodoResponse[]> {
        return await this.todoRepository.getUnTaggedTodosForMain(userId);
    }

    async getCompletedTodosForMain(userId : string): Promise<TodoResponse[]> {
        return await this.todoRepository.getCompletedTodosForMain(userId);
    }

    async getAllTodos(userId: string, todayTodoDto: TodayTodoDto){
        return await this.todoRepository.findTodosAll(userId, todayTodoDto)
    }

    async getTodosByDate(userId: string, datePaginationDto: DatePaginationDto) {
        return await this.todoRepository.findByDate(userId, datePaginationDto)
    }

    async getTodosByPagination(userId: string, paginationDto: PaginationDto ) : Promise<GetTodosPaginationResponse> {
        return await this.todoRepository.findByPagination(userId, paginationDto)
    }

    async getCompletedTodosByPagination(userId: string, paginationDto: PaginationDto ) : Promise<GetTodosPaginationResponse> {
        return await this.todoRepository.findCompletedTodoByPagination(userId, paginationDto)
    }

    async getTodosByTag(userId: string, getByTagDto: GetByTagDto): Promise<GetTodosResponseByTag> {
        return await this.todoRepository.findByTagId(userId, getByTagDto)
    }

    async getTodayTodos(userId : string, todayTodoDto: TodayTodoDto) : Promise<GetTodayTodosResponse> {
        return await this.todoRepository.getTodayTodos(userId, todayTodoDto);
    }

    /* 검색 */
    async getTodosBySearch(userId: string, content: string): Promise<TodoResponse[]> {
        return await this.todoRepository.findTodosBySearch(userId, content)
    }



    async updateTodoToComplete(userId: string, todoId: string, notRepeatTodoCompleteDto: NotRepeatTodoCompleteDto) : Promise<void> {
        return this.todoRepository.updateTodoToComplete(userId, todoId, notRepeatTodoCompleteDto)
    }

    async updateRepeatTodoToComplete(userId : string, todoId : string, createTodoDto : CreateTodoDto){
        return this.todoRepository.updateRepeatTodoToComplete(userId, todoId, createTodoDto)
    }

    async updateSubTodo(userId: string, subTodoId: string, updateSubTodoDto: UpdateSubTodoDto) {
        return this.todoRepository.updateSubTodo(userId, subTodoId, updateSubTodoDto)
    }

    /* Todo 삭제 - 스케줄을 지우면 알아서 지워짐 */
    async deleteTodo(userId: string, todoId: string): Promise<void> {
        //get existing todo by todoId
        const existingTodo = await this.todoRepository.findTodoWithScheduleIdByTodoId(todoId);
        if(!existingTodo) throw new HttpException({message: 'Todo not found',},HttpStatus.NOT_FOUND);
        const {schedule} = existingTodo
        const { id: scheduleId } = schedule
        return await this.scheduleService.deleteSchedule(userId, scheduleId);
    }

    async deleteSubTodoOfTodo(userId: string,
        todoId: string, subTodoId: string): Promise<void> {
        return await this.todoRepository.deleteSubTodoOfTodo(userId, todoId, subTodoId);
    }

    async updateTodoFlag(userId: string,todoId: string, flag: boolean) {
        if(flag === null){
            throw new HttpException(
                'flag must be a boolean value',
                HttpStatus.BAD_REQUEST,
            );
        }
        return await this.todoRepository.updateTodoFlag(userId, todoId, flag)
    }

    /* 드래그앤드랍 오더링 */
    async updateTodosOrder(userId: string, updateTodosOrderDto: UpdateTodosOrderDto) {
        return this.todoRepository.updateTodosOrder(userId, updateTodosOrderDto)
    }

    async updateTodayTodosOrder(userId: string, updateTodosOrderDto: UpdateTodosOrderDto) {
        return this.todoRepository.updateTodayTodosOrder(userId, updateTodosOrderDto)
    }

    async updateTodosOrderInTag(userId: string, updateTodosOrderDto: UpdateTodosInTagOrderDto) {
        return this.todoRepository.updateTodosOrderInTag(userId, updateTodosOrderDto)
    }

    async updateSubTodosOrder(userId: string, updateTodosOrderDto: UpdateSubTodosOrderDto) {
        return this.todoRepository.updateSubTodosOrder(userId, updateTodosOrderDto)
    }
}
