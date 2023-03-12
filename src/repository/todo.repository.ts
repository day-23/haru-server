import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Todo } from "src/entity/todo.entity";
import { CreateTodoDto, UpdateTodoDto } from "src/todos/dto/create.todo.dto";
import { UserService } from "src/users/users.service";
import { EntityManager, getRepository, Repository } from "typeorm";
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
        private readonly tagsService: TagsService,
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
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
            .leftJoinAndSelect('todo.alarms', 'alarm')
            .leftJoinAndSelect('todo.tagWithTodos', 'tagwithtodo')
            .leftJoinAndSelect('tagwithtodo.tag', 'tag')
            .where('todo.user = :userId', { userId })
            .orderBy('todo.createdAt', 'DESC')
            .select(['todo.id', 'todo.content', 'todo.memo', 'todo.todayTodo', 'todo.flag', 'todo.repeatOption', 'todo.repeat', 'todo.repeatEnd', 'todo.endDate', 'todo.endDateTime', 'todo.createdAt'])
            .addSelect(['subtodo.id', 'subtodo.content'])
            .addSelect(['alarm.id', 'alarm.time'])
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
            .leftJoinAndSelect('todo.alarms', 'alarm')
            .leftJoinAndSelect('todo.tagWithTodos', 'tagwithtodo')
            .leftJoinAndSelect('tagwithtodo.tag', 'tag')
            .where('todo.user = :userId', { userId })
            .orderBy('todo.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .select(['todo.id', 'todo.content', 'todo.memo', 'todo.todayTodo', 'todo.flag', 'todo.repeatOption', 'todo.repeat', 'todo.repeatEnd', 'todo.endDate', 'todo.endDateTime', 'todo.createdAt'])
            .addSelect(['subtodo.id', 'subtodo.content'])
            .addSelect(['alarm.id', 'alarm.time'])
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
            .leftJoinAndSelect('todo.alarms', 'alarms')
            .leftJoinAndSelect('todo.subTodos', 'subTodos')
            .where('tag.id = :tagId', { tagId })
            .andWhere('tag.user = :userId', { userId })
            .select(['tag.id', 'tag.content'])
            .addSelect(['tagWithTodos.id'])
            .addSelect(['todo.id', 'todo.content', 'todo.memo', 'todo.todayTodo', 'todo.flag', 'todo.repeatOption', 'todo.repeat', 'todo.endDate', 'todo.endDateTime', 'todo.createdAt'])
            .addSelect(['alarms.id', 'alarms.time'])
            .addSelect(['subTodos.id', 'subTodos.content'])
            .take(10)
            .getMany()


        console.log(ret[0].tagWithTodos.length)
        
        return {
            data: ret
        }
    }

    /* 투두 생성 함수 */
    async create(userId: string, todo: CreateTodoDto) {
        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            /* 투두 데이터 저장 */
            const savedTodo = await queryRunner.manager.save(Todo, {
                ...todo,
                user: userId,
            });

            /* 서브 투두 데이터 저장 */
            const newSubTodos = todo.subTodos.map((subTodo) => ({
                todo: savedTodo.id,
                content: subTodo,
            }));
            const savedSubTodos = await queryRunner.manager.save(SubTodo, newSubTodos);
            const retSubTodos = savedSubTodos.map(({ id, content }) => ({ id, content }));

            /* 투두에 대한 태그 저장 */
            const savedTags = await this.tagsService.createTags(userId, { contents: todo.tags });
            const retTags = savedTags.map(({ id, content }) => ({ id, content }));

            /* 투두 알람 저장 */
            const newAlarms = todo.alarms.map((alarm) => ({
                user: userId,
                todo: savedTodo.id,
                time: alarm,
            }));
            const savedAlarms = await queryRunner.manager.save(Alarm, newAlarms);
            const retAlarms = savedAlarms.map(({ id, time }) => ({ id, time }));

            /* 사용자에 대한 태그와 투두의 정보 저장 */
            const tagWithTodos = savedTags.map(({ id: tag }) => ({
                todo: savedTodo.id,
                tag,
                user: userId,
            }));
            await queryRunner.manager.save(TagWithTodo, tagWithTodos);

            await queryRunner.commitTransaction();

            return { ...savedTodo, subTodos: retSubTodos, tags: retTags, alarms: retAlarms };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new HttpException(
                {
                    message: 'SQL error',
                    error: error.sqlMessage,
                },
                HttpStatus.FORBIDDEN,
            );
        } finally {
            await queryRunner.release();
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