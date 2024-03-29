import { Todo } from 'src/entity/todo.entity';
import { Subtodo } from 'src/entity/subtodo.entity';
import { TodoTags } from 'src/entity/todo-tags.entity';
import { QueryRunner } from 'typeorm';
import { BaseTodoDto, CreateBaseTodoDto, CreateTodoDto, UpdateSubTodosDtoWhenUpdateTodo } from '../dto/create.todo.dto';
import { DatePaginationDto, DateTimePaginationDto, TodayTodoDto } from 'src/common/dto/date-pagination.dto';
import { GetAllTodosResponse, GetTodayTodosResponse, GetTodosForMain, GetTodosPaginationResponse, GetTodosResponseByDate, GetTodosResponseByTag, TodoResponse } from './todo.return.interface';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { GetByTagDto } from '../dto/geybytag.todo.dto';
import { UpdateSubTodoDto } from '../dto/create.subtodo.dto';
import { UpdateSubTodosOrderDto, UpdateTodosInTagOrderDto, UpdateTodosOrderDto } from '../dto/order.todo.dto';
import { NotRepeatTodoCompleteDto, RepeatSplitBackDto, RepeatSplitFrontDto, RepeatSplitMiddleDto } from '../dto/repeat.todo.dto';

export interface TodoRepositoryInterface {
    /* create */
    createTodo(userId: string, scheduleId: string, createBaseTodoDto: CreateBaseTodoDto, queryRunner?: QueryRunner): Promise<Todo>;
    createTodoTags(userId: string, todoId: string, tagIds: string[], queryRunner?: QueryRunner): Promise<TodoTags[]>;
    createSubTodos(todoId: string, contents: string[], queryRunner?: QueryRunner): Promise<Subtodo[]>;
    createSubTodosForUpdateBySplit(todoId: string, contents: string[], subTodosCompleted : boolean[] , queryRunner?: QueryRunner): Promise<Subtodo[]>;

    /* update */
    updateTodo(userId: string, todoId: string, updateBaseTodoDto: Partial<BaseTodoDto>, queryRunner?: QueryRunner): Promise<Todo>;
    updateTodoTags(userId: string, todoId: string, tagIds: string[], queryRunner?: QueryRunner): Promise<TodoTags[]>;
    updateSubTodos(todoId: string, updateSubTodoDto: UpdateSubTodosDtoWhenUpdateTodo, queryRunner?: QueryRunner): Promise<Subtodo[]>;
    updateSubTodo(userId: string, subTodoId: string, updateSubTodoDto: UpdateSubTodoDto): Promise<Subtodo>
    updateSubTodosToUnCompleteByTodoId(todoId: string, queryRunner?: QueryRunner): Promise<Subtodo[]>;

    updateTodosOrder(userId: string, updateTodosOrderDto: UpdateTodosOrderDto): Promise<void>
    updateTodayTodosOrder(userId: string, updateTodosOrderDto: UpdateTodosOrderDto): Promise<void>
    updateTodosOrderInTag(userId: string, updateTodosInTagOrderDto: UpdateTodosInTagOrderDto): Promise<void>
    updateSubTodosOrder(userId: string, updateSubTodosOrderDto: UpdateSubTodosOrderDto): Promise<void>
    updateUnRepeatTodoToComplete(todoId: string, notRepeatTodoCompleteDto: NotRepeatTodoCompleteDto, queryRunner?: QueryRunner): Promise<void>


    /* read */
    findTodosAll(userId: string, todayTodoDto: TodayTodoDto): Promise<GetAllTodosResponse>;
    findTodosForMain(userId: string): Promise<GetTodosForMain>;
    findFlaggedTodosForMain(userId: string): Promise<TodoResponse[]>;
    findTaggedTodosForMain(userId: string): Promise<TodoResponse[]>;
    findUnTaggedTodosForMain(userId: string): Promise<TodoResponse[]>;
    findCompletedTodosForMain(userId: string): Promise<TodoResponse[]>;
    findTodayTodos(userId: string, date: TodayTodoDto): Promise<GetTodayTodosResponse>
    findByDateTime(userId: string, dateTimePaginationDto: DateTimePaginationDto): Promise<GetTodosResponseByDate> 
    findByPagination(userId: string, paginationDto: PaginationDto): Promise<GetTodosPaginationResponse>;
    findStatisticsByDateTime(userId: string, dateTimePaginationDto: DateTimePaginationDto): Promise<any>

    findCompletedTodoByPagination(userId: string, paginationDto: PaginationDto): Promise<GetTodosPaginationResponse>
    findByTagId(userId: string, getByTagDto: GetByTagDto): Promise<GetTodosResponseByTag>

    findNextSubTodoOrder(todoId: string): Promise<number>;
    findNextTodoOrder(userId: string): Promise<number>;
    findNextTodayTodoOrder(userId: string): Promise<number>;
    findTodoWithScheduleIdByTodoId(todoId: string): Promise<Todo>;

    /* delete */
    deleteTodoById(userId: string, todoId: string): Promise<void> 
    deleteSubTodoOfTodo(userId: string, todoId: string, subTodoId: string): Promise<void>
}
