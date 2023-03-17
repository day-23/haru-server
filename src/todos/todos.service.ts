import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatePaginationDto } from 'src/common/dto/date-pagination.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Todo } from 'src/entity/todo.entity';
import { TodoRepository } from 'src/repository/todo.repository';
import { CreateTagDto } from 'src/tags/dto/create.tag.dto';
import { NotRepeatTodoCompleteDto } from './dto/complete.todo.dto';
import { CreateSubTodoDto, UpdateSubTodoDto } from './dto/create.subtodo.dto';
import { CreateAlarmByTimeDto, CreateTodoDto, UpdateTodoDto } from './dto/create.todo.dto';
import { GetByTagDto } from './dto/geybytag.todo.dto';
import { UpdateSubTodosOrderDto, UpdateTodosInTagOrderDto, UpdateTodosOrderDto } from './dto/order.todo.dto';
import { GetTodosPaginationResponse, GetTodoResponse, GetTodosResponseByTag, CreateTodoResponse } from './interface/todo.interface';

@Injectable()
export class TodosService {
    constructor(private readonly todoRepository: TodoRepository) { }

    async getAllTodos(): Promise<Todo[]> {
        return await this.todoRepository.findAll()
    }

    async getTodosByDate(userId: string, datePaginationDto: DatePaginationDto) {
        return await this.todoRepository.findByDate(userId, datePaginationDto)
    }

    async getTodosByPagination(userId: string, paginationDto: PaginationDto ) : Promise<GetTodosPaginationResponse> {
        return await this.todoRepository.findByPagination(userId, paginationDto)
    }

    async getTodosByTag(userId: string, getByTagDto: GetByTagDto): Promise<GetTodosResponseByTag> {
        return await this.todoRepository.findByTagId(userId, getByTagDto)
    }

    /* 검색 */
    async getTodosBySearch(userId: string, content: string): Promise<GetTodoResponse[]> {
        return await this.todoRepository.findTodosBySearch(userId, content)
    }


    async createTodo(userId: string, todo: CreateTodoDto): Promise<CreateTodoResponse> {
        return await this.todoRepository.create(userId, todo);
    }

    async updateTodo(userId: string, todoId: string, todo: UpdateTodoDto): Promise<Todo> {
        return await this.todoRepository.update(userId, todoId, todo);
    }

    async updateTodoToComplete(userId: string, todoId: string, notRepeatTodoCompleteDto: NotRepeatTodoCompleteDto) : Promise<void> {
        return this.todoRepository.updateTodoToComplete(userId, todoId, notRepeatTodoCompleteDto)
    }

    async updateSubTodo(userId: string, subTodoId: string, updateSubTodoDto: UpdateSubTodoDto) {
        return this.todoRepository.updateSubTodo(userId, subTodoId, updateSubTodoDto)
    }

    async deleteTodo(userId: string, todoId: string): Promise<void> {
        return await this.todoRepository.delete(userId, todoId);
    }

    async deleteTagOfTodo(userId: string,
        todoId: string, tagId: string): Promise<void> {
        return this.todoRepository.deleteTagOfTodo(userId, todoId, tagId);
    }

    async deleteSubTodoOfTodo(userId: string,
        todoId: string, subTodoId: string): Promise<void> {
        return this.todoRepository.deleteSubTodoOfTodo(userId, todoId, subTodoId);
    }

    /* 이미 생성된 투두에 데이터 추가 */
    async createAlarmToTodo(userId: string, todoId: string, addAlarmToTodoDto: CreateAlarmByTimeDto) {
        return await this.todoRepository.createAlarmToTodo(userId, todoId, addAlarmToTodoDto)
    }

    async createTagToTodo(userId: string, todoId: string, createTagDto: CreateTagDto) {
        return await this.todoRepository.createTagToTodo(userId, todoId, createTagDto)
    }

    async createSubTodoToTodo(userId: string, todoId: string, createSubTodoDto: CreateSubTodoDto) {
        return await this.todoRepository.createSubTodoToTodo(userId, todoId, createSubTodoDto)
    }


    /* 드래그앤드랍 오더링 */
    async updateTodosOrder(userId: string, updateTodosOrderDto: UpdateTodosOrderDto) {
        return this.todoRepository.updateTodosOrder(userId, updateTodosOrderDto)
    }

    async updateTodosOrderInTag(userId: string, updateTodosOrderDto: UpdateTodosInTagOrderDto) {
        return this.todoRepository.updateTodosOrderInTag(userId, updateTodosOrderDto)
    }

    async updateSubTodosOrder(userId: string, updateTodosOrderDto: UpdateSubTodosOrderDto) {
        return this.todoRepository.updateSubTodosOrder(userId, updateTodosOrderDto)
    }
}
