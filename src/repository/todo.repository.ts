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
import { GetByTagDto } from "src/todos/dto/geybytag.todo.dto";
import { Alarm } from "src/entity/alarm.entity";


export class TodoRepository {
    constructor(@InjectRepository(Todo) private readonly repository: Repository<Todo>,
        @InjectRepository(SubTodo) private readonly subTodoRepository: Repository<SubTodo>,
        @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
        @InjectRepository(TagWithTodo) private readonly tagWithTodoRepository: Repository<TagWithTodo>,
        @InjectRepository(Alarm) private readonly alarmRepository: Repository<Alarm>,
        private readonly userService: UserService,
        private readonly tagsService: TagsService
    ) { }

    async findAll(): Promise<Todo[]> {
        return await this.repository.find()
    }

    /* 투두 데이트 페이지네이션 함수 */
    async findByDate(userId: string, datePaginationDto: DatePaginationDto) {
        const startDate = fromYYYYMMDDToDate(datePaginationDto.startDate)
        const endDate = fromYYYYMMDDAddOneDayToDate(datePaginationDto.endDate)

        // /* subtodo, tag 조인, 페이지네이션 */
        const [todos, count] = await this.repository.createQueryBuilder('todo')
            .leftJoinAndSelect('todo.subTodos', 'subtodo')
            .leftJoinAndSelect('todo.tagWithTodos', 'tagwithtodo')
            .leftJoinAndSelect('tagwithtodo.tag', 'tag')
            .where('todo.user = :userId', { userId })
            .orderBy('todo.createdAt', 'DESC')
            .select(['todo.id', 'todo.content', 'todo.memo', 'todo.todayTodo', 'todo.flag', 'todo.repeatOption', 'todo.repeat', 'todo.repeatEnd', 'todo.endDate', 'todo.endDateTime', 'todo.createdAt'])
            .addSelect(['subtodo.id', 'subtodo.content'])
            .addSelect(['tagwithtodo.id'])
            .addSelect(['tag.id', 'tag.content'])
            .getManyAndCount();

        /* tag 내용 파싱 */
        const result = todos.map(({ tagWithTodos, ...todo }) => ({
            ...todo,
            tags: tagWithTodos.map((tagWithTodo) => {
                return {
                    id: tagWithTodo.tag.id,
                    content: tagWithTodo.tag.content
                }
            })
        }))


        return {
            data: result,
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

        // /* subtodo, tag 조인, 페이지네이션 */
        const [todos, count] = await this.repository.createQueryBuilder('todo')
            .leftJoinAndSelect('todo.subTodos', 'subtodo')
            .leftJoinAndSelect('todo.tagWithTodos', 'tagwithtodo')
            .leftJoinAndSelect('tagwithtodo.tag', 'tag')
            .where('todo.user = :userId', { userId })
            .orderBy('todo.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .select(['todo.id', 'todo.content', 'todo.memo', 'todo.todayTodo', 'todo.flag', 'todo.repeatOption', 'todo.repeat', 'todo.repeatEnd', 'todo.endDate', 'todo.endDateTime', 'todo.createdAt'])
            .addSelect(['subtodo.id', 'subtodo.content'])
            .addSelect(['tagwithtodo.id'])
            .addSelect(['tag.id', 'tag.content'])
            .getManyAndCount();

        const totalPages = Math.ceil(count / limit);

        /* tag 내용 파싱 */
        const result = todos.map(({ tagWithTodos, ...todo }) => ({
            ...todo,
            tags: tagWithTodos.map((tagWithTodo) => {
                return {
                    id: tagWithTodo.tag.id,
                    content: tagWithTodo.tag.content
                }
            })
        }))

        return {
            data: result,
            pagination: {
                totalItems: count,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: totalPages,
            },
        };
    }


    /* 태그 별로 투두를 조회하는 함수 */
    async findByTagId(userId: string, getByTagDto: GetByTagDto) {
        const tagId = getByTagDto.tagId

        const ret = await this.tagRepository.createQueryBuilder('tag')
            .leftJoinAndSelect('tag.tagWithTodos', 'tagWithTodos')
            .leftJoinAndSelect('tagWithTodos.todo', 'todo')
            .leftJoinAndSelect('todo.subTodos', 'subTodos')
            .where('tag.id = :tagId', { tagId })
            .andWhere('tag.user = :userId', { userId })
            // .select(['tag.id', 'tag.content'])
            // .addSelect(['tagWithTodos.id'])
            .getMany()
        return {
            data: ret
        }
    }

    /* 투두 생성 함수 */
    async create(userId: string, todo: CreateTodoDto) {
        // const user = await this.userService.findOne(userId);
        try {
            /* 투두 데이터 저장 */
            const ret = await this.repository.save({
                ...todo,
                user: userId,
            });

            /* 서브 투두 데이터 저장 */
            const newSubTodos = todo.subTodos.map((subTodo) => ({
                todo: ret.id,
                content: subTodo,
            }));
            const savedSubTodos = await this.subTodoRepository.save(newSubTodos);
            const retSubTodos = savedSubTodos.map(({ id, content }) => ({ id, content }));

            /* 투두에 대한 태그 저장 */
            const savedTags = await this.tagsService.createTags(userId, { contents: todo.tags })
            const retTags = savedTags.map(({ id, content }) => ({ id, content }));

            /* 투두 알람 저장 */
            const newAlarms = todo.alarms.map((alarm) => ({
                user : userId,
                todo: ret.id,
                time : alarm
            }))
            const savedAlarms = await this.alarmRepository.save(newAlarms)
            const retAlarms = savedAlarms.map(({id, time}) => ({id, time}))

            /* 사용자에 대한 태그와 투두의 정보 저장 */
            const tagWithTodos = savedTags.map(({ id: tag }) => ({
                todo: ret.id,
                tag,
                user: userId,
            }))
            this.tagWithTodoRepository.save(tagWithTodos)

            return { ...ret, subTodos: retSubTodos, tags: retTags, alarms: retAlarms };
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
                HttpStatus.INTERNAL_SERVER_ERROR,
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