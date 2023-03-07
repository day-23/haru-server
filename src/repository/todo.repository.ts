import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Todo } from "src/entity/todo.entity";
import { CreateTodoDto } from "src/todos/dto/create.dto";
import { Repository } from "typeorm";

export class TodoRepository {
    constructor(@InjectRepository(Todo) private readonly repository: Repository<Todo>) { }

    async findAll(): Promise<Todo[]> {
        return await this.repository.find()
    }

    async findByPagination(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const take = limit;

        const [users, count] = await this.repository.findAndCount({
            skip,
            take: limit,
        });
        const totalPages = Math.ceil(count / limit);
        return {
            success: true,
            data: users,
            pagination: {
                total_items: count,
                items_per_page: limit,
                current_page: page,
                total_pages: totalPages,
            },
        };


        // return await this.repository.find({
        //     skip,
        //     take,
        //     order: {
        //         createdAt: 'DESC'
        //     }
        // })
    }

    async create(todo: CreateTodoDto): Promise<Todo> {
        try {
            return await this.repository.save({ ...todo });
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

    async update(id: string, todo: Todo): Promise<Todo> {
        await this.repository.update(id, todo);
        return await this.repository.findOne({ where: { id } });
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

}