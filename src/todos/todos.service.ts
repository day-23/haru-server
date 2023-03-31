import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatePaginationDto, TodayTodoDto } from 'src/common/dto/date-pagination.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Subtodo } from 'src/entity/subtodo.entity';
import { ScheduleService } from 'src/schedules/schedules.service';
import { TagsService } from 'src/tags/tags.service';
import { TodoRepository } from 'src/todos/todo.repository';
import { DataSource, QueryRunner } from 'typeorm';
import { NotRepeatTodoCompleteDto, RepeatTodoCompleteBySplitDto } from './dto/complete.todo.dto';
import { CreateSubTodoDto, UpdateSubTodoDto } from './dto/create.subtodo.dto';
import { CreateBaseTodoDto, CreateTodoDto, UpdateTodoDto } from './dto/create.todo.dto';
import { GetByTagDto } from './dto/geybytag.todo.dto';
import { UpdateSubTodosOrderDto, UpdateTodosInTagOrderDto, UpdateTodosOrderDto } from './dto/order.todo.dto';
import { GetTodosPaginationResponse, GetTodosResponseByTag, GetTodosForMain, TodoResponse, GetTodayTodosResponse, GetAllTodosResponse } from './interface/todo.return.interface';
import { TodoServiceInterface } from './interface/todo.service.interface';
import { existingTodoToCreateTodoDto, parseTodoResponse } from './todo.util';

@Injectable()
export class TodosService implements TodoServiceInterface {
    constructor(private readonly todoRepository: TodoRepository,
        private readonly scheduleService: ScheduleService,
        private readonly tagService: TagsService,
        private dataSource: DataSource
    ) { }

    async createTodo(userId: string, createTodoDto: CreateTodoDto, queryRunner?: QueryRunner): Promise<TodoResponse> {
        const { todayTodo, flag, completed, tags, subTodos, endDate, ...createScheduleDto } = createTodoDto

        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();

        try {
            // Start the transaction
            await queryRunner.startTransaction();
            const savedSchedule = await this.scheduleService.createSchedule(userId, { ...createScheduleDto, repeatStart: endDate, categoryId: null }, queryRunner);
            const savedTodo = await this.todoRepository.createTodo(userId, savedSchedule.id, { todayTodo, flag, completed, folded:false }, queryRunner);

            const savedTags = await this.tagService.createTagsOrderedByInput(userId, { contents: tags }, queryRunner);
            await this.todoRepository.createTodoTags(userId, savedTodo.id, savedTags.map(tag => tag.id), queryRunner);

            const savedSubTodos = await this.todoRepository.createSubTodos(savedTodo.id, subTodos, queryRunner);

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

    async updateTodo(userId: string, todoId: string, updateTodoDto: UpdateTodoDto, queryRunner?: QueryRunner): Promise<TodoResponse> {
        //get existing todo by todoId
        const existingTodo = await this.todoRepository.findTodoWithScheduleIdByTodoId(todoId);
        if (!existingTodo) throw new HttpException({ message: 'Todo not found', }, HttpStatus.NOT_FOUND);

        const { schedule } = existingTodo
        const { id: scheduleId } = schedule
        const { todayTodo, flag, tags, completed, subTodos, subTodosCompleted, endDate, ...createScheduleDto } = updateTodoDto

        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();

        try {
            // Start the transaction
            await queryRunner.startTransaction();
            const updatedSchedule = await this.scheduleService.updateSchedule(userId, scheduleId, { ...createScheduleDto, repeatStart: endDate, categoryId: null }, queryRunner);
            const updatedTodo = await this.todoRepository.updateTodo(userId, todoId, { todayTodo, completed, flag, folded:false }, queryRunner);
            const updatedTags = await this.tagService.createTagsOrderedByInput(userId, { contents: tags }, queryRunner);
            await this.todoRepository.updateTodoTags(userId, todoId, updatedTags.map(tag => tag.id), queryRunner);

            const updatedSubTodos = await this.todoRepository.updateSubTodos(todoId, { contents: subTodos, subTodosCompleted }, queryRunner);

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

    async getTodosForMain(userId: string): Promise<GetTodosForMain> {
        return await this.todoRepository.findTodosForMain(userId);
    }

    async getFlaggedTodosForMain(userId: string): Promise<TodoResponse[]> {
        return await this.todoRepository.findFlaggedTodosForMain(userId);
    }

    async getTaggedTodosForMain(userId: string): Promise<TodoResponse[]> {
        return await this.todoRepository.findTaggedTodosForMain(userId);
    }

    async getUnTaggedTodosForMain(userId: string): Promise<TodoResponse[]> {
        return await this.todoRepository.getUnTaggedTodosForMain(userId);
    }

    async getCompletedTodosForMain(userId: string): Promise<TodoResponse[]> {
        return await this.todoRepository.findCompletedTodosForMain(userId);
    }

    async getAllTodos(userId: string, todayTodoDto: TodayTodoDto): Promise<GetAllTodosResponse> {
        return await this.todoRepository.findTodosAll(userId, todayTodoDto)
    }

    async getTodosByDate(userId: string, datePaginationDto: DatePaginationDto) {
        return await this.todoRepository.findByDate(userId, datePaginationDto)
    }

    async getTodosByPagination(userId: string, paginationDto: PaginationDto): Promise<GetTodosPaginationResponse> {
        return await this.todoRepository.findByPagination(userId, paginationDto)
    }

    async getCompletedTodosByPagination(userId: string, paginationDto: PaginationDto): Promise<GetTodosPaginationResponse> {
        return await this.todoRepository.findCompletedTodoByPagination(userId, paginationDto)
    }

    async getTodosByTag(userId: string, getByTagDto: GetByTagDto): Promise<GetTodosResponseByTag> {
        return await this.todoRepository.findByTagId(userId, getByTagDto)
    }

    async getTodayTodos(userId: string, todayTodoDto: TodayTodoDto): Promise<GetTodayTodosResponse> {
        return await this.todoRepository.findTodayTodos(userId, todayTodoDto);
    }

    /* 검색 */
    async getTodosBySearch(userId: string, content: string): Promise<TodoResponse[]> {
        return await this.todoRepository.findTodosBySearch(userId, content)
    }

    async updateUnRepeatTodoToComplete(userId: string, todoId: string, notRepeatTodoCompleteDto: NotRepeatTodoCompleteDto, queryRunner?: QueryRunner): Promise<void> {
        return this.todoRepository.updateUnRepeatTodoToComplete(todoId, notRepeatTodoCompleteDto, queryRunner)
    }

    /* 리팩토링 필요 */
    async updateRepeatTodoToComplete(userId: string, todoId: string, repeatTodoCompleteBySplitDto: RepeatTodoCompleteBySplitDto, queryRunner?: QueryRunner): Promise<TodoResponse> {
        const existingTodo = await this.todoRepository.findTodoWithScheduleIdByTodoId(todoId);
        const { completedDate } = repeatTodoCompleteBySplitDto

        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();

        const { id, user, schedule, ...todoData } = existingTodo

        try {
            // Start the transaction
            if (!queryRunner.isTransactionActive) {
                await queryRunner.startTransaction();
            }

            const createTodoDto = existingTodoToCreateTodoDto(existingTodo)

            /* 기존 애를 변경 */
            const ret = await this.scheduleService.updateSchedulePartialAndSave(userId, schedule, { repeatEnd: completedDate })

            console.log(ret)
            /* 완료한 애를 하나 만듦 */
            const completedTodo = await this.createTodo(userId, createTodoDto, queryRunner)
            await this.todoRepository.updateUnRepeatTodoToComplete(completedTodo.id, { completed: true }, queryRunner)

            createTodoDto.endDate = completedDate
            await this.createTodo(userId, createTodoDto, queryRunner)

            return completedTodo
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
            if (shouldReleaseQueryRunner) {
                // Release the queryRunner if it was created in this function
                queryRunner.release();
            }
        }
    }

    async updateSubTodo(userId: string, subTodoId: string, updateSubTodoDto: UpdateSubTodoDto): Promise<Subtodo> {
        return this.todoRepository.updateSubTodo(userId, subTodoId, updateSubTodoDto)
    }

    /* Todo 삭제 - 스케줄을 지우면 알아서 지워짐 */
    async deleteTodo(userId: string, todoId: string): Promise<void> {
        //get existing todo by todoId
        const existingTodo = await this.todoRepository.findTodoWithScheduleIdByTodoId(todoId);
        if (!existingTodo) throw new HttpException({ message: 'Todo not found', }, HttpStatus.NOT_FOUND);
        const { schedule } = existingTodo
        const { id: scheduleId } = schedule
        return await this.scheduleService.deleteSchedule(userId, scheduleId);
    }

    async deleteSubTodoOfTodo(userId: string,
        todoId: string, subTodoId: string): Promise<void> {
        return await this.todoRepository.deleteSubTodoOfTodo(userId, todoId, subTodoId);
    }

    async updateTodoFlag(userId: string, todoId: string, flag: boolean): Promise<void> {
        if (flag === null) {
            throw new HttpException(
                'flag must be a boolean value',
                HttpStatus.BAD_REQUEST,
            );
        }
        return await this.todoRepository.updateTodoFlag(userId, todoId, flag)
    }

    async updateTodoFolded(userId: string, todoId: string, folded: boolean): Promise<void> {
        if (folded === null) {
            throw new HttpException(
                'folded must be a boolean value',
                HttpStatus.BAD_REQUEST,
            );
        }
        return await this.todoRepository.updateTodoFolded(userId, todoId, folded)
    }

    /* 드래그앤드랍 오더링 */
    async updateTodosOrder(userId: string, updateTodosOrderDto: UpdateTodosOrderDto): Promise<void> {
        return this.todoRepository.updateTodosOrder(userId, updateTodosOrderDto)
    }

    async updateTodayTodosOrder(userId: string, updateTodosOrderDto: UpdateTodosOrderDto): Promise<void> {
        return this.todoRepository.updateTodayTodosOrder(userId, updateTodosOrderDto)
    }

    async updateTodosOrderInTag(userId: string, updateTodosOrderDto: UpdateTodosInTagOrderDto): Promise<void> {
        return this.todoRepository.updateTodosOrderInTag(userId, updateTodosOrderDto)
    }

    async updateSubTodosOrder(userId: string, updateTodosOrderDto: UpdateSubTodosOrderDto): Promise<void> {
        return this.todoRepository.updateSubTodosOrder(userId, updateTodosOrderDto)
    }
}
