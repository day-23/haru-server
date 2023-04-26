import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DateTimePaginationDto, TodayTodoDto } from 'src/common/dto/date-pagination.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { getMinusOneDay } from 'src/common/makeDate';
import { Subtodo } from 'src/entity/subtodo.entity';
import { Todo } from 'src/entity/todo.entity';
import { TagsService } from 'src/tags/tags.service';
import { DataSource, QueryRunner } from 'typeorm';
import { DeleteRepeatSplitMiddleDto, NotRepeatTodoCompleteDto, RepeatSplitBackDto, RepeatSplitFrontDto, RepeatSplitMiddleDto, UpdateRepeatBackTodoBySplitDto, UpdateRepeatFrontTodoBySplitDto, UpdateRepeatMiddleTodoBySplitDto } from './dto/repeat.todo.dto';
import { UpdateSubTodoDto } from './dto/create.subtodo.dto';
import { CreateTodoDto, UpdateTodoDto } from './dto/create.todo.dto';
import { GetByTagDto } from './dto/geybytag.todo.dto';
import { UpdateSubTodosOrderDto, UpdateTodosInTagOrderDto, UpdateTodosOrderDto } from './dto/order.todo.dto';
import { TodoRepositoryInterface } from './interface/todo.repository.interface';
import { GetTodosPaginationResponse, GetTodosResponseByTag, GetTodosForMain, TodoResponse, GetTodayTodosResponse, GetAllTodosResponse, GetTodosResponseByDate } from './interface/todo.return.interface';
import { TodosServiceInterface } from './interface/todo.service.interface';
import { existingTodoToCreateTodoDto, parseTodoResponse } from './todo.util';
import { ScheduleServiceInterface } from 'src/schedules/interface/schedule.service.interface';

@Injectable()
export class TodosService implements TodosServiceInterface {
    constructor(
        @Inject('TodoRepositoryInterface') private readonly todoRepository: TodoRepositoryInterface,
        @Inject('ScheduleServiceInterface') private readonly scheduleService: ScheduleServiceInterface,
        private readonly tagService: TagsService,
        private readonly dataSource: DataSource
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

    async createTodoForUpdateBySplit(userId: string, updateTodoDto: UpdateTodoDto, queryRunner?: QueryRunner): Promise<TodoResponse> {
        const { todayTodo, flag, completed, tags, subTodos, subTodosCompleted, endDate, ...createScheduleDto } = updateTodoDto

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

            const savedSubTodos = await this.todoRepository.createSubTodosForUpdateBySplit(savedTodo.id, subTodos, subTodosCompleted, queryRunner);

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
            console.log(updatedTags)
            const ret = await this.todoRepository.updateTodoTags(userId, todoId, updatedTags.map(tag => tag.id), queryRunner);
            console.log(ret)
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
        return await this.todoRepository.findUnTaggedTodosForMain(userId);
    }

    async getCompletedTodosForMain(userId: string): Promise<TodoResponse[]> {
        return await this.todoRepository.findCompletedTodosForMain(userId);
    }

    async getAllTodos(userId: string, todayTodoDto: TodayTodoDto): Promise<GetAllTodosResponse> {
        return await this.todoRepository.findTodosAll(userId, todayTodoDto)
    }


    async getTodosByDateTime(userId: string, dateTimePaginationDto: DateTimePaginationDto): Promise<GetTodosResponseByDate>{
        return await this.todoRepository.findByDateTime(userId, dateTimePaginationDto)
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

    async updateRepeatTodoToCompleteFront(userId: string, todoId: string, repeatTodoCompleteBySplitDto: RepeatSplitFrontDto, queryRunner?: QueryRunner): Promise<void> {
        const existingTodo = await this.todoRepository.findTodoWithScheduleIdByTodoId(todoId);
        const { schedule } = existingTodo
        const { endDate } = repeatTodoCompleteBySplitDto

        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();

        try {
            // Start the transaction
            if (!queryRunner.isTransactionActive) {
                await queryRunner.startTransaction();
            }
            /* 기존 애를 변경 */
            await this.scheduleService.updateSchedulePartialAndSave(userId, schedule, { repeatStart: endDate }, queryRunner)

            /* 완료한 애를 하나 만듦 */
            await this.createNewCompletedTodoByExistingTodo(userId, existingTodo, queryRunner)

            await queryRunner.commitTransaction();
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

    async updateRepeatTodoToCompleteMiddle(userId: string, todoId: string, repeatTodoCompleteMiddleBySplitDto: RepeatSplitMiddleDto, queryRunner?: QueryRunner): Promise<void> {
        const existingTodo = await this.todoRepository.findTodoWithScheduleIdByTodoId(todoId);
        const { completedDate, endDate } = repeatTodoCompleteMiddleBySplitDto
        const { schedule } = existingTodo

        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();

        try {
            // Start the transaction
            if (!queryRunner.isTransactionActive) {
                await queryRunner.startTransaction();
            }
            
            await this.scheduleService.updateSchedulePartialAndSave(userId, schedule, { repeatEnd: getMinusOneDay(completedDate) }, queryRunner)
            await this.createNewCompletedTodoByExistingTodo(userId, existingTodo, queryRunner)
            await this.createNewNextRepeatTodoByExistingTodo(userId, existingTodo, endDate, queryRunner)

            await queryRunner.commitTransaction();
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

    async updateTodosParentId(userId : string, existingTodo : Todo, queryRunner: QueryRunner){
        const {schedule} = existingTodo
        const schedules = await this.scheduleService.getSchedulesByParent(userId, schedule.id)

        if(schedules.length === 0) return
        const scheduleIds = schedules.map(schedule => schedule.id)
        const nextParentId = scheduleIds.shift()

        await Promise.all([
            this.scheduleService.updateSchedulesParentId(userId, scheduleIds, nextParentId, queryRunner),
            this.scheduleService.updateScheduleParentToNull(userId, nextParentId, queryRunner)
        ])
    }

    async updateRepeatTodoToCompleteBack(userId: string, todoId: string, repeatTodoCompleteBySplitDto: RepeatSplitBackDto, queryRunner?: QueryRunner): Promise<void> {
        const existingTodo = await this.todoRepository.findTodoWithScheduleIdByTodoId(todoId);
        const { schedule } = existingTodo
        const { repeatEnd } = repeatTodoCompleteBySplitDto

        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();

        try {
            // Start the transaction
            if (!queryRunner.isTransactionActive) {
                await queryRunner.startTransaction();
            }

            await this.scheduleService.updateSchedulePartialAndSave(userId, schedule, { repeatEnd }, queryRunner)
            await this.createNewCompletedTodoByExistingTodo(userId, existingTodo, queryRunner)

            await queryRunner.commitTransaction();
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

    async createNewTodoByExistingTodo(userId: string ,existingTodo : Todo, queryRunner?: QueryRunner): Promise<TodoResponse>{
        const createTodoDto = existingTodoToCreateTodoDto(existingTodo)
        return await this.createTodo(userId, createTodoDto, queryRunner)
    }

    async createNewNextRepeatTodoByExistingTodo(userId: string ,existingTodo : Todo, endDate:Date, queryRunner?: QueryRunner): Promise<TodoResponse>{
        const { id, user, schedule, ...todoData } = existingTodo

        const createTodoDto = existingTodoToCreateTodoDto(existingTodo)

        const parent = schedule?.parent ? schedule?.parent?.id : schedule.id

        /* 다음 할일을 만듦 */
        return await this.createTodo(userId, { ...createTodoDto, endDate, repeatEnd: schedule.repeatEnd, parent}, queryRunner)
    }

    async createNewCompletedTodoByExistingTodo(userId: string ,existingTodo : Todo, queryRunner?: QueryRunner): Promise<void>{
        const completedTodo = await this.createNewTodoByExistingTodo(userId, existingTodo, queryRunner)
        await this.todoRepository.updateUnRepeatTodoToComplete(completedTodo.id, { completed: true }, queryRunner)
    }

    async updateSubTodo(userId: string, subTodoId: string, updateSubTodoDto: UpdateSubTodoDto): Promise<Subtodo> {
        return this.todoRepository.updateSubTodo(userId, subTodoId, updateSubTodoDto)
    }

    /* Todo 삭제 - 스케줄을 지우면 알아서 지워짐 */
    async deleteTodo(userId: string, todoId: string): Promise<void> {
        return await this.todoRepository.deleteTodoById(userId, todoId)
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
        await this.todoRepository.updateTodo(userId, todoId, {flag})
    }

    async updateTodoFolded(userId: string, todoId: string, folded: boolean): Promise<void> {
        if (folded === null) {
            throw new HttpException(
                'folded must be a boolean value',
                HttpStatus.BAD_REQUEST,
            );
        }
        await this.todoRepository.updateTodo(userId, todoId, {folded})
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

    async updateRepeatTodoFront(userId: string, todoId : string, updateRepeatFrontTodoBySplitDto: UpdateRepeatFrontTodoBySplitDto, queryRunner? : QueryRunner) : Promise<void>{
        const existingTodo = await this.todoRepository.findTodoWithScheduleIdByTodoId(todoId);
        const { nextEndDate, ...updateTodoDto } = updateRepeatFrontTodoBySplitDto
        const { schedule } = existingTodo

        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();

        try {
            // Start the transaction
            if (!queryRunner.isTransactionActive) {
                await queryRunner.startTransaction();
            }
            /* 기존 애를 변경 */
            await this.scheduleService.updateSchedulePartialAndSave(userId, schedule, { repeatStart: nextEndDate }, queryRunner)

            /* 새로운 애를 만듦 */
            await this.createTodoForUpdateBySplit(userId, updateTodoDto, queryRunner)

            await queryRunner.commitTransaction();
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

    async updateRepeatTodoMiddle(userId: string, todoId : string, updateRepeatMiddleTodoBySplitDto: UpdateRepeatMiddleTodoBySplitDto,  queryRunner? : QueryRunner): Promise<void>{
        const existingTodo = await this.todoRepository.findTodoWithScheduleIdByTodoId(todoId);
        const { changedDate, nextEndDate, ...updateTodoDto } = updateRepeatMiddleTodoBySplitDto
        const { schedule } = existingTodo

        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();

        try {
            // Start the transaction
            if (!queryRunner.isTransactionActive) {
                await queryRunner.startTransaction();
            }
            
            await this.scheduleService.updateSchedulePartialAndSave(userId, schedule, { repeatEnd: getMinusOneDay(changedDate) }, queryRunner)
            await this.createTodoForUpdateBySplit(userId, updateTodoDto, queryRunner)
            await this.createNewNextRepeatTodoByExistingTodo(userId, existingTodo, nextEndDate, queryRunner)

            await queryRunner.commitTransaction();
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

    async updateRepeatTodoBack(userId: string, todoId: string, updateRepeatBackTodoBySplitDto: UpdateRepeatBackTodoBySplitDto, queryRunner?: QueryRunner): Promise<void> {
        const existingTodo = await this.todoRepository.findTodoWithScheduleIdByTodoId(todoId);
        const { schedule } = existingTodo
        const { preRepeatEnd , ...updateTodoDto } = updateRepeatBackTodoBySplitDto

        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();

        try {
            // Start the transaction
            if (!queryRunner.isTransactionActive) {
                await queryRunner.startTransaction();
            }

            await this.scheduleService.updateSchedulePartialAndSave(userId, schedule, { repeatEnd : preRepeatEnd }, queryRunner)
            /* 새로운 애를 만듦 */
            await this.createTodoForUpdateBySplit(userId, updateTodoDto, queryRunner)

            await queryRunner.commitTransaction();
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

    async deleteRepeatTodoFront(userId: string, todoId: string, repeatSplitFrontDto: RepeatSplitFrontDto, queryRunner?: QueryRunner): Promise<void>{
        const existingTodo = await this.todoRepository.findTodoWithScheduleIdByTodoId(todoId);
        const { schedule } = existingTodo
        const { endDate } = repeatSplitFrontDto

        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();

        try {
            // Start the transaction
            if (!queryRunner.isTransactionActive) {
                await queryRunner.startTransaction();
            }

            // await this.updateTodosParentId(userId, existingTodo, queryRunner)

            /* 기존 애를 변경 */
            await this.scheduleService.updateSchedulePartialAndSave(userId, schedule, { repeatStart: endDate }, queryRunner)

            await queryRunner.commitTransaction();
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
    async deleteRepeatTodoMiddle(userId: string, todoId: string, repeatSplitMiddleDto: DeleteRepeatSplitMiddleDto, queryRunner?: QueryRunner): Promise<void>{
        const existingTodo = await this.todoRepository.findTodoWithScheduleIdByTodoId(todoId);
        const { removedDate, endDate } = repeatSplitMiddleDto
        const { schedule } = existingTodo

        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();

        try {
            // Start the transaction
            if (!queryRunner.isTransactionActive) {
                await queryRunner.startTransaction();
            }

            await this.scheduleService.updateSchedulePartialAndSave(userId, schedule, { repeatEnd: getMinusOneDay(removedDate) }, queryRunner)
            await this.createNewNextRepeatTodoByExistingTodo(userId, existingTodo, endDate, queryRunner)

            await queryRunner.commitTransaction();
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
    async deleteRepeatTodoBack(userId: string, todoId: string, repeatSplitBackDto: RepeatSplitBackDto, queryRunner?: QueryRunner): Promise<void>{
        const existingTodo = await this.todoRepository.findTodoWithScheduleIdByTodoId(todoId);
        const { schedule } = existingTodo
        const { repeatEnd } = repeatSplitBackDto

        // Create a new queryRunner if one was not provided
        const shouldReleaseQueryRunner = !queryRunner;
        queryRunner = queryRunner || this.dataSource.createQueryRunner();

        try {
            // Start the transaction
            if (!queryRunner.isTransactionActive) {
                await queryRunner.startTransaction();
            }

            await this.scheduleService.updateSchedulePartialAndSave(userId, schedule, { repeatEnd }, queryRunner)

            await queryRunner.commitTransaction();
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
}
