import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from 'src/entity/todo.entity';
import { TodoRepository } from 'src/repository/todo.repository';
import { CreateTodoDto } from './dto/create.dto';

@Injectable()
export class TodosService {
    constructor(private readonly todoRepository: TodoRepository) { }

    async getAllTodos(): Promise<Todo[]> {
        return await this.todoRepository.findAll()
    }

    async getAllTodosByPagination(page = 1, limit = 10): Promise<Todo[]> {
        return await this.todoRepository.findByPagination(page, limit)
    }

    async createTodo(user: CreateTodoDto): Promise<Todo> {
        return await this.todoRepository.create(user);
    }

    async updateTodo(id: string, todo: Todo): Promise<Todo> {
        return await this.todoRepository.update(id, todo);
    }

    async deleteTodo(id: string): Promise<void> {
        return await this.todoRepository.delete(id);
    }
}
