import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Todo } from "src/entity/todo.entity";
import { CreateTodoDto, UpdateTodoDto } from "src/todos/dto/create.todo.dto";
import { UserService } from "src/users/users.service";
import { Repository } from "typeorm";
// import { makeDateStringToUtcDate } from "src/common/makeDate";
import { SubTodo } from "src/entity/sub-todo.entity";
import { Tag } from "src/entity/tag.entity";
import { DatePaginationDto } from "src/common/dto/date-pagination.dto";
import { fromYYYYMMDDAddOneDayToDate, fromYYYYMMDDToDate } from "src/common/makeDate";
import { TagsService } from "src/tags/tags.service";
import { TagWithTodo } from "src/entity/tag-with-todo.entity";


export class TodoRepository {
    constructor(@InjectRepository(Todo) private readonly repository: Repository<Todo>,
        @InjectRepository(SubTodo) private readonly subTodoRepository: Repository<SubTodo>,
        @InjectRepository(TagWithTodo) private readonly tagWithTodoRepository: Repository<TagWithTodo>,
        private readonly userService: UserService,
        private readonly tagsService : TagsService
    ) { }

    async findAll(): Promise<Todo[]> {
        return await this.repository.find()
    }

    /* 투두 데이트 페이지네이션 함수 */
    async findByDate(userId:string, datePaginationDto: DatePaginationDto){
        const startDate = fromYYYYMMDDToDate(datePaginationDto.startDate)
        const endDate = fromYYYYMMDDAddOneDayToDate(datePaginationDto.endDate)

        /* subtodo 조인, Date 페이지네이션 */
        const [todos, count] = await this.repository.createQueryBuilder('todo')
                .leftJoinAndSelect('todo.subTodos', 'subtodo')
                .leftJoinAndSelect('todo.tagWithTodos', 'tagwithtodo')
                .where('todo.user = :userId', { userId })
                .andWhere('todo.repeatEnd BETWEEN :startDate AND :endDate', { startDate, endDate })
                .orderBy('todo.createdAt', 'DESC')
                .getManyAndCount();

        return {
            data: todos,
            pagination: {
                totalItems: count,
                startDate,
                endDate
            },
        };
    }

    /* 투두 페이지네이션 함수 */
    async findByPagination(userId: string, paginationDto: PaginationDto) {
        const { page, limit } = paginationDto
        const skip = (page - 1) * limit;

        // /* subtodo 조인, 페이지네이션 */
        const [todos, count] = await this.repository.createQueryBuilder('todo')
                .leftJoinAndSelect('todo.subTodos', 'subtodo')
                .leftJoinAndSelect('todo.tagWithTodos', 'tagwithtodo')
                .leftJoinAndSelect('tagwithtodo.tag', 'tag')
                .where('todo.user = :userId', { userId })
                .orderBy('todo.createdAt', 'DESC')
                .skip(skip)
                .take(limit)
                .getManyAndCount();

        // const [todos, count] = await this.repository.createQueryBuilder('todo')
        //         .leftJoinAndSelect('todo.subTodos', 'subtodo')
        //         .leftJoinAndSelect('todo.tagWithTodos', 'tagwithtodo')
        //         .leftJoinAndSelect('tagwithtodo.tag', 'tag')
        //         .where('todo.user = :userId', { userId })
        //         .orderBy('todo.createdAt', 'DESC')
        //         .skip(skip)
        //         .take(limit)
        //         .select(['todo.id as todoId', 'todo.content', 'todo.memo', 'todo.todayTodo', 'todo.flag', 'todo.repeatOption', 'todo.repeat', 'todo.repeatEnd', 'todo.endDate', 'todo.endDateTime'])
        //         .addSelect(['subtodo.id', 'subtodo.content'])
        //         .addSelect(['tagwithtodo.id'])
        //         .addSelect(['tag.id', 'tag.content'])
        //         .getRawMany();


        const totalPages = Math.ceil(count / limit);
        return {
            data: todos,
            pagination: {
                totalItems: count,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: totalPages,
            },
        };
    }

    /* 투두 생성 함수 */
    async create(userId: string, todo: CreateTodoDto): Promise<Todo> {
        // const user = await this.userService.findOne(userId);
        try {
            const newTodo = new Todo({
                ...todo,
                user : userId,
            });

            /* 투두 데이터 저장 */
            const ret = await this.repository.save(newTodo);
            
            /* 서브 투두 데이터 저장 */
            const subTodos = todo.subTodos.map(subTodo => {
                const newSubTodo = new SubTodo({
                    todo: ret.id,
                    content: subTodo
                });
                return newSubTodo;
            });
            await this.subTodoRepository.save(subTodos);

            /* 투두에 대한 태그 저장 */
            const savedTags = await this.tagsService.createTags(userId, {contents:todo.tags})
            const tagWithTodos = savedTags.map((tag)=>{
                const newTagWithTodo = new TagWithTodo({
                    todo : ret.id,
                    tag: tag.id,
                })
                return newTagWithTodo
            })

            this.tagWithTodoRepository.save(tagWithTodos)
            return ret;

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

    async update(userId: string, todoId: string, todo: UpdateTodoDto): Promise<Todo> {
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
            user: { id: userId },
            id: todoId
        });
    }
}