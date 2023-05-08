import { DatePaginationDto, DateTimePaginationDto, TodayTodoDto } from "src/common/dto/date-pagination.dto"
import { PaginationDto } from "src/common/dto/pagination.dto"
import { Subtodo } from "src/entity/subtodo.entity"
import { QueryRunner } from "typeorm"
import { DeleteRepeatSplitMiddleDto, NotRepeatTodoCompleteDto, RepeatSplitBackDto, RepeatSplitFrontDto, RepeatSplitMiddleDto, UpdateRepeatBackTodoBySplitDto, UpdateRepeatByDivide, UpdateRepeatFrontTodoBySplitDto, UpdateRepeatMiddleTodoBySplitDto } from "../dto/repeat.todo.dto"
import { UpdateSubTodoDto } from "../dto/create.subtodo.dto"
import { CreateTodoDto, UpdateTodoDto } from "../dto/create.todo.dto"
import { GetByTagDto } from "../dto/geybytag.todo.dto"
import { UpdateSubTodosOrderDto, UpdateTodosInTagOrderDto, UpdateTodosOrderDto } from "../dto/order.todo.dto"
import { GetAllTodosResponse, GetTodayTodosResponse, GetTodosForMain, GetTodosPaginationResponse, GetTodosResponseByDate, GetTodosResponseByTag, TodoResponse } from "./todo.return.interface"


export interface TodosServiceInterface {
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
    getTodosByDateTime(userId: string, dateTimePaginationDto: DateTimePaginationDto): Promise<GetTodosResponseByDate>
    getTodosByPagination(userId: string, paginationDto: PaginationDto): Promise<GetTodosPaginationResponse>
    getCompletedTodosByPagination(userId: string, paginationDto: PaginationDto): Promise<GetTodosPaginationResponse>
    getTodosByTag(userId: string, getByTagDto: GetByTagDto): Promise<GetTodosResponseByTag>
    getTodayTodos(userId: string, todayTodoDto: TodayTodoDto): Promise<GetTodayTodosResponse>

    /* update */
    updateTodo(userId: string, todoId: string, updateTodoDto: UpdateTodoDto, queryRunner?: QueryRunner): Promise<TodoResponse>
    updateUnRepeatTodoToComplete(userId: string, todoId: string, notRepeatTodoCompleteDto: NotRepeatTodoCompleteDto, queryRunner?: QueryRunner): Promise<void>

    /* 투두 완료 API */
    updateRepeatTodoToCompleteFront(userId: string, todoId: string, repeatTodoCompleteBySplitDto: RepeatSplitFrontDto, queryRunner?: QueryRunner): Promise<void>
    updateRepeatTodoToCompleteMiddle(userId: string, todoId: string, repeatTodoCompleteBySplitDto: RepeatSplitMiddleDto, queryRunner?: QueryRunner): Promise<void>
    updateRepeatTodoToCompleteBack(userId: string, todoId: string, repeatTodoCompleteBySplitDto: RepeatSplitBackDto, queryRunner?: QueryRunner): Promise<void>
    
    updateSubTodo(userId: string, subTodoId: string, updateSubTodoDto: UpdateSubTodoDto): Promise<Subtodo>
    updateTodoFlag(userId: string, todoId: string, flag: boolean): Promise<void>
    updateTodoFolded(userId: string, todoId: string, folded: boolean): Promise<void>
    updateTodosOrder(userId: string, updateTodosOrderDto: UpdateTodosOrderDto): Promise<void>
    updateTodayTodosOrder(userId: string, updateTodosOrderDto: UpdateTodosOrderDto): Promise<void>
    updateTodosOrderInTag(userId: string, updateTodosOrderDto: UpdateTodosInTagOrderDto): Promise<void>
    updateSubTodosOrder(userId: string, updateTodosOrderDto: UpdateSubTodosOrderDto): Promise<void>

    updateRepeatTodoFront(userId: string, todoId : string, updateRepeatFrontTodoBySplitDto: UpdateRepeatFrontTodoBySplitDto, queryRunner? : QueryRunner) : Promise<void>
    updateRepeatTodoMiddle(userId: string, todoId : string, updateRepeatMiddleTodoBySplitDto: UpdateRepeatMiddleTodoBySplitDto): Promise<void>
    updateRepeatTodoBack(userId: string, todoId : string, updateRepeatBackTodoBySplitDto: UpdateRepeatBackTodoBySplitDto): Promise<void>
    
    /* delete */
    deleteTodo(userId: string, todoId: string): Promise<void>
    deleteSubTodoOfTodo(userId: string, todoId: string, subTodoId: string): Promise<void>

    deleteRepeatTodoFront(userId: string, todoId: string, repeatSplitFrontDto: RepeatSplitFrontDto): Promise<void>
    deleteRepeatTodoMiddle(userId: string, todoId: string, repeatSplitMiddleDto: DeleteRepeatSplitMiddleDto): Promise<void>
    deleteRepeatTodoBack(userId: string, todoId: string, repeatSplitBackDto: RepeatSplitBackDto): Promise<void>
}