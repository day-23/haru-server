import { DatePaginationDto, TodayTodoDto } from "src/common/dto/date-pagination.dto"
import { PaginationDto } from "src/common/dto/pagination.dto"
import { Subtodo } from "src/entity/subtodo.entity"
import { QueryRunner } from "typeorm"
import { NotRepeatTodoCompleteDto, RepeatTodoCompleteBySplitDto } from "../dto/complete.todo.dto"
import { UpdateSubTodoDto } from "../dto/create.subtodo.dto"
import { CreateTodoDto, UpdateTodoDto } from "../dto/create.todo.dto"
import { GetByTagDto } from "../dto/geybytag.todo.dto"
import { UpdateSubTodosOrderDto, UpdateTodosInTagOrderDto, UpdateTodosOrderDto } from "../dto/order.todo.dto"
import { GetAllTodosResponse, GetTodayTodosResponse, GetTodosForMain, GetTodosPaginationResponse, GetTodosResponseByDate, GetTodosResponseByTag, TodoResponse } from "./todo.return.interface"


export interface TodoServiceInterface {
    /* create */
    createTodo(userId: string, createTodoDto: CreateTodoDto, queryRunner?: QueryRunner): Promise<TodoResponse>

    /* read */
    getTodosForMain(userId: string): Promise<GetTodosForMain>
    getFlaggedTodosForMain(userId: string): Promise<TodoResponse[]>
    getTaggedTodosForMain(userId: string): Promise<TodoResponse[]>
    getUnTaggedTodosForMain(userId: string): Promise<TodoResponse[]>
    getCompletedTodosForMain(userId: string): Promise<TodoResponse[]>
    getTodosBySearch(userId: string, content: string): Promise<TodoResponse[]>
    getAllTodos(userId: string, todayTodoDto: TodayTodoDto): Promise<GetAllTodosResponse>
    getTodosByDate(userId: string, datePaginationDto: DatePaginationDto): Promise<GetTodosResponseByDate>
    getTodosByPagination(userId: string, paginationDto: PaginationDto): Promise<GetTodosPaginationResponse>
    getCompletedTodosByPagination(userId: string, paginationDto: PaginationDto): Promise<GetTodosPaginationResponse>
    getTodosByTag(userId: string, getByTagDto: GetByTagDto): Promise<GetTodosResponseByTag>
    getTodayTodos(userId: string, todayTodoDto: TodayTodoDto): Promise<GetTodayTodosResponse>

    /* update */
    updateTodo(userId: string, todoId: string, updateTodoDto: UpdateTodoDto, queryRunner?: QueryRunner): Promise<TodoResponse>
    updateUnRepeatTodoToComplete(userId: string, todoId: string, notRepeatTodoCompleteDto: NotRepeatTodoCompleteDto, queryRunner?: QueryRunner): Promise<void>
    updateRepeatTodoToCompleteBySplit(userId: string, todoId: string, repeatTodoCompleteBySplitDto: RepeatTodoCompleteBySplitDto, queryRunner?: QueryRunner): Promise<TodoResponse>
    updateSubTodo(userId: string, subTodoId: string, updateSubTodoDto: UpdateSubTodoDto): Promise<Subtodo>
    updateTodoFlag(userId: string, todoId: string, flag: boolean): Promise<void>
    updateTodosOrder(userId: string, updateTodosOrderDto: UpdateTodosOrderDto): Promise<void>
    updateTodayTodosOrder(userId: string, updateTodosOrderDto: UpdateTodosOrderDto): Promise<void>
    updateTodosOrderInTag(userId: string, updateTodosOrderDto: UpdateTodosInTagOrderDto): Promise<void>
    updateSubTodosOrder(userId: string, updateTodosOrderDto: UpdateSubTodosOrderDto): Promise<void>

    /* delete */
    deleteTodo(userId: string, todoId: string): Promise<void>
    deleteSubTodoOfTodo(userId: string, todoId: string, subTodoId: string): Promise<void>
}