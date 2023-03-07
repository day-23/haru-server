import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Todo } from "src/entity/todo.entity";
import { CreateTodoDto } from "src/todos/dto/create.dto";
import { UserService } from "src/users/users.service";
import { Repository } from "typeorm";

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
            where: { user: { id: userId } },
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
            return this.repository.save({ ...todo, user });
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