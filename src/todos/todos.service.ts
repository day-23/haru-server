import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Todo } from 'src/entity/todo.entity';
import { TodoRepository } from 'src/repository/todo.repository';
import { CreateTodoDto, UpdateTodoDto } from './dto/create.dto';

@Injectable()
export class TodosService {
    constructor(private readonly todoRepository: TodoRepository) { }

    async getAllTodos(): Promise<Todo[]> {
        return await this.todoRepository.findAll()
    }

    async getTodosByPagination(userId: string, paginationDto: PaginationDto) {
        return await this.todoRepository.findByPagination(userId, paginationDto)
    }

    async createTodo(userId: string, todo: CreateTodoDto): Promise<Todo> {
        return await this.todoRepository.create(userId, todo);
    }

    async updateTodo(userId: string, todoId: string, todo: UpdateTodoDto): Promise<Todo> {
        return await this.todoRepository.update(userId, todoId, todo);
    }

    async deleteTodo(userId: string, todoId: string): Promise<void> {
        return await this.todoRepository.delete(userId, todoId);
    }
}
