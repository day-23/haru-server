import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatePaginationDto } from 'src/common/dto/date-pagination.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Todo } from 'src/entity/todo.entity';
import { TodoRepository } from 'src/repository/todo.repository';
import { AddAlarmToTodoDto, CreateTodoDto, UpdateTodoDto } from './dto/create.todo.dto';
import { GetByTagDto } from './dto/geybytag.todo.dto';

@Injectable()
export class TodosService {
    constructor(private readonly todoRepository: TodoRepository) { }

    async getAllTodos(): Promise<Todo[]> {
        return await this.todoRepository.findAll()
    }

    async getTodosByDate(userId: string, datePaginationDto: DatePaginationDto) {
        return await this.todoRepository.findByDate(userId, datePaginationDto)
    }

    async getTodosByPagination(userId: string, paginationDto: PaginationDto) {
        return await this.todoRepository.findByPagination(userId, paginationDto)
    }

    async getTodosByTag(userId: string, getByTagDto: GetByTagDto) {
        return await this.todoRepository.findByTagId(userId, getByTagDto)
    }

    async createTodo(userId: string, todo: CreateTodoDto) {
        return await this.todoRepository.create(userId, todo);
    }

    async updateTodo(userId: string, todoId: string, todo: UpdateTodoDto): Promise<Todo> {
        return await this.todoRepository.update(userId, todoId, todo);
    }

    async deleteTodo(userId: string, todoId: string): Promise<void> {
        return await this.todoRepository.delete(userId, todoId);
    }

    async deleteTagOfTodo(userId: string,
        todoId: string, tagId: string): Promise<void> {
        return this.todoRepository.deleteTagOfTodo(userId, todoId, tagId);
    }

    async deleteSubTodoOfTodo( userId: string,
        todoId: string, subTodoId: string): Promise<void> {
        return this.todoRepository.deleteSubTodoOfTodo(userId, todoId, subTodoId);
    }

    /* 이미 생성된 투두에 데이터 추가 */
    async createAlarmToTodo(userId: string, todoId: string, addAlarmToTodoDto:AddAlarmToTodoDto) {
        return await this.todoRepository.createAlarmToTodo(userId, todoId, addAlarmToTodoDto)
    }
}
