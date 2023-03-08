import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Todo } from "src/entity/todo.entity";
import { CreateTodoDto } from "src/todos/dto/create.dto";
import { UserService } from "src/users/users.service";
import { Repository } from "typeorm";
import * as moment from 'moment-timezone';
import { makeDateApplyTimeZone } from "src/common/makeDate";



export class TodoRepository {
    constructor(@InjectRepository(Todo) private readonly repository: Repository<Todo>,
        private readonly userService: UserService
    ) { }

    async findAll(): Promise<Todo[]> {
        return await this.repository.find()
    }

    async findByPagination(userId: string, paginationDto: PaginationDto) {
        const { page, limit } = paginationDto
        const skip = (page - 1) * limit;
        const take = limit;

        const [users, count] = await this.repository.findAndCount({
            where: { user: userId },
            skip,
            take: limit,
        });
        const totalPages = Math.ceil(count / limit);
        return {
            data: users,
            pagination: {
                totalItems: count,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: totalPages,
            },
        };
    }

    async create(userId: string, todo: CreateTodoDto): Promise<Todo> {
        const user = await this.userService.findOne(userId);

        try {
            const newTodo = new Todo({
                ...todo,
                repeatEnd: makeDateApplyTimeZone(todo.repeatEnd),
                endDate: makeDateApplyTimeZone(todo.endDate),
                endDateTime: makeDateApplyTimeZone(todo.endDateTime),
                user: user.id,
            });
            return this.repository.save(newTodo);
        } catch (error) {
            throw new HttpException(
                {
                    message: 'SQL에러',
                    error: error.sqlMessage,
                },
                HttpStatus.FORBIDDEN,
            );
        }
    }

    async update(userId: string, todoId: string, todo: Todo): Promise<Todo> {
        const existingTodo = await this.repository.findOne({ where: { id: todoId } });

        if (!existingTodo) {
            throw new HttpException(
                'Todo not found',
                HttpStatus.NOT_FOUND,
            );
        }

        try {
            const updatedTodo = new Todo({
                ...existingTodo,
                ...todo,
            });
            return this.repository.save(updatedTodo);
        } catch (error) {
            throw new HttpException(
                {
                    message: 'SQL error',
                    error: error.sqlMessage,
                },
                HttpStatus.FORBIDDEN,
            );
        }
    }

    async delete(userId: string, todoId: string): Promise<void> {
        await this.repository.delete({
            user: userId,
            id: todoId
        });
    }
}