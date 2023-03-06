import { InjectRepository } from "@nestjs/typeorm";
import { Todo } from "src/entity/todo.entity";
import { Repository } from "typeorm";

export class TodoRepository {
    constructor(@InjectRepository(Todo) private readonly repository: Repository<Todo>) { }

    async findAll(): Promise<Todo[]> {
        return await this.repository.find()
    }

    async findAllbyPagination(page = 1, limit = 10): Promise<Todo[]> {
        const skip = (page - 1) * limit;
        const take = limit;

        return await this.repository.find({
            skip,
            take,
            order: {
                createdAt: 'DESC'
            }
        })
    }
}