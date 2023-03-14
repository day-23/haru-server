import { ConflictException, HttpException, HttpStatus } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Todo } from "src/entity/todo.entity";
import { CreateAlarmByTimeDto, CreateTodoDto, UpdateTodoDto } from "src/todos/dto/create.todo.dto";
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
import { formattedTodoDataFromTagRawQuery } from "src/common/utils/data-utils";
import { AlarmsService } from "src/alarms/alarms.service";
import { CreateAlarmsDto } from "src/alarms/dto/create.alarm.dto";
import { CreateTagDto } from "src/tags/dto/create.tag.dto";
import { CreateSubTodoDto } from "src/todos/dto/create.subtodo.dto";


export class TodoRepository {
    constructor(@InjectRepository(Todo) private readonly repository: Repository<Todo>,
        @InjectRepository(SubTodo) private readonly subTodoRepository: Repository<SubTodo>,
        @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
        @InjectRepository(TagWithTodo) private readonly tagWithTodoRepository: Repository<TagWithTodo>,
        @InjectRepository(Alarm) private readonly alarmRepository: Repository<Alarm>,
        private readonly userService: UserService,
        private readonly tagsService: TagsService,
        private readonly alarmsService: AlarmsService,
        @InjectEntityManager() private readonly entityManager: EntityManager,
    ) { }

    async findAll(): Promise<Todo[]> {
        return await this.repository.find()
    }


    /* 투두 데이트 페이지네이션 함수 */
    async findByDate(userId: string, datePaginationDto: DatePaginationDto) {
        const startDate = fromYYYYMMDDToDate(datePaginationDto.startDate)
        const endDate = fromYYYYMMDDAddOneDayToDate(datePaginationDto.endDate)

        const [todos, count] = await this.repository.createQueryBuilder('todo')
            .leftJoinAndSelect('todo.subTodos', 'subtodo')
            .leftJoinAndSelect('todo.alarms', 'alarm')
            .leftJoinAndSelect('todo.tagWithTodos', 'tagwithtodo')
            .leftJoinAndSelect('tagwithtodo.tag', 'tag')
            .where('todo.user = :userId', { userId })
            .andWhere('todo.end_date IS NOT NULL')
            .andWhere('((todo.end_date >= :startDate AND todo.end_date < :endDate) OR (todo.repeat_end > :startDate AND todo.repeat_end <= :endDate))')
            .setParameters({ startDate, endDate })
            .select(['todo.id', 'todo.content', 'todo.memo', 'todo.todayTodo', 'todo.flag', 'todo.repeatOption', 'todo.repeat', 'todo.repeatEnd', 'todo.endDate', 'todo.endDateTime', 'todo.createdAt'])
            .addSelect(['subtodo.id', 'subtodo.content'])
            .addSelect(['alarm.id', 'alarm.time'])
            .addSelect(['tagwithtodo.id'])
            .addSelect(['tag.id', 'tag.content'])
            .orderBy('todo.end_date', 'ASC')
            .addOrderBy('todo.repeat_end', 'DESC')
            .addOrderBy('todo.created_at', 'ASC')
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
    /* 태그별로 조회해도 해당 투두에 다시 태그를 포함해야함 */
    async findByTagId(userId: string, getByTagDto: GetByTagDto) {
        const tagId = getByTagDto.tagId

        const LIMIT = 50
        const ret = await this.entityManager.query(`
            WITH dt AS (
                SELECT todo.id id
                FROM tag_with_todo twt
                JOIN todo ON twt.todo_id = todo.id
                WHERE twt.tag_id = ?
                AND todo.user_id = ?
                LIMIT ?
            )
            SELECT 
                todo.id as "todo_id",
                todo.content as "todo_content",
                todo.memo as "todo_memo",
                todo.today_todo as "todo_todayTodo",
                todo.flag as "todo_flag",
                todo.repeat_option as "todo_repeatOption",
                todo.repeat as "todo_repeat",
                todo.end_date as "todo_endDate",
                todo.end_date_time as "todo_endDateTime",
                todo.created_At as "todo_created_At",
                alarm.id as "alarm_id",
                alarm.time as "alarm_time",
                sub_todo.id as "subTodo_id",
                sub_todo.content as "subTodo_content",
                tag.id as "tag_id",
                tag.content as "tag_content"
            FROM dt
            JOIN todo ON dt.id = todo.id
            LEFT JOIN tag_with_todo twt ON dt.id = twt.todo_id
            LEFT JOIN tag ON twt.tag_id = tag.id
            LEFT JOIN alarm ON dt.id = alarm.todo_id
            LEFT JOIN sub_todo ON dt.id = sub_todo.todo_id
        `, [tagId, userId, LIMIT]);

        return {
            data: formattedTodoDataFromTagRawQuery(ret)
        }
    }

    /* 투두 생성 함수 */
    async create(userId: string, todo: CreateTodoDto) {
        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            console.log(todo)

            /* 투두 데이터 저장 */
            const savedTodo = await queryRunner.manager.save(Todo, {
                ...todo,
                user: userId,
            });

            /* 서브 투두 데이터 저장 */
            const newSubTodos = todo.subTodos.map((subTodo) => ({
                todo: savedTodo.id,
                user: userId,
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


    /* 투두에서 태그를 지우는 함수 */
    async deleteTagOfTodo(userId: string,
        todoId: string, tagId: string): Promise<void> {
        const result = await this.tagWithTodoRepository.delete({
            user: { id: userId },
            tag: { id: tagId },
            todo: { id: todoId }
        })

        if (result.affected === 0) {
            throw new HttpException(
                `No tag with ID ${tagId} associated with todo with ID ${todoId} and user with ID ${userId} was found`,
                HttpStatus.NOT_FOUND,
            );
        }
    }

    /* 투두에서 서브 투두를 지우는 함수 */
    async deleteSubTodoOfTodo(userId: string,
        todoId: string, subTodoId: string): Promise<void> {
        const result = await this.subTodoRepository.delete({
            id: subTodoId,
            user: { id: userId },
        })

        if (result.affected === 0) {
            throw new HttpException(
                `No subTodo with ID ${subTodoId} associated with todo with ID ${todoId} and user with ID ${userId} was found`,
                HttpStatus.NOT_FOUND,
            );
        }
    }

    /* 이미 생성된 투두에 데이터 추가 */
    /* 알람 추가 */
    async createAlarmToTodo(userId: string, todoId: string, dto: CreateAlarmByTimeDto) {
        const result = await this.alarmsService.createAlarm(userId, todoId, null, dto)
        return { id: result.id, todoId: result.todo, time: result.time }
    }

    /* 서브투두 추가 */
    async createSubTodoToTodo(userId: string, todoId: string, createSubTodoDto: CreateSubTodoDto) {
        const { content } = createSubTodoDto
        const newSubTodo = this.subTodoRepository.create({ user: userId, todo: todoId, content })
        const ret = await this.subTodoRepository.save(newSubTodo)

        return { id: ret.id, content }
    }

    /* 태그를 추가 */
    async createTagToTodo(userId: string, todoId: string, createTagDto: CreateTagDto) {
        const { content } = createTagDto;

        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const existingTag = await queryRunner.manager.findOne(Tag, { where: { user: { id: userId }, content } });

            if (existingTag) {
                const existingTagWithTodo = await queryRunner.manager.findOne(TagWithTodo, { where: { user: { id: userId }, todo: { id: todoId }, tag: { id: existingTag.id } } });

                if (existingTagWithTodo) {
                    throw new ConflictException(`Tag with this todo already exists`);
                }

                const newTagWithTodo = queryRunner.manager.create(TagWithTodo, { user: userId, todo: todoId, tag: existingTag });
                const savedNewTagWithTodo = await queryRunner.manager.save(newTagWithTodo);
                await queryRunner.commitTransaction();
                return savedNewTagWithTodo;
            }

            const newTag = queryRunner.manager.create(Tag, { user: userId, content });
            const ret = await queryRunner.manager.save(newTag);

            const newTagWithTodo = queryRunner.manager.create(TagWithTodo, { user: userId, todo: todoId, tag: ret });
            const savedNewTagWithTodo = await queryRunner.manager.save(newTagWithTodo);

            await queryRunner.commitTransaction();
            return savedNewTagWithTodo;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }


    async getTodosBySearch(userId: string, content: string) {
        const todos = await this.repository.createQueryBuilder('todo')
            .leftJoinAndSelect('todo.subTodos', 'subtodo')
            .leftJoinAndSelect('todo.alarms', 'alarm')
            .leftJoinAndSelect('todo.tagWithTodos', 'tagwithtodo')
            .leftJoinAndSelect('tagwithtodo.tag', 'tag')
            .where('todo.user = :userId', { userId })
            .andWhere('(LOWER(todo.content) LIKE LOWER(:searchValue) OR LOWER(tag.content) LIKE LOWER(:searchValue))')
            .setParameters({ searchValue: `%${content}%` })
            .select(['todo.id', 'todo.content', 'todo.memo', 'todo.todayTodo', 'todo.flag', 'todo.repeatOption', 'todo.repeat', 'todo.repeatEnd', 'todo.endDate', 'todo.endDateTime', 'todo.createdAt'])
            .addSelect(['subtodo.id', 'subtodo.content'])
            .addSelect(['alarm.id', 'alarm.time'])
            .addSelect(['tagwithtodo.id'])
            .addSelect(['tag.id', 'tag.content'])
            .orderBy('todo.createdAt', 'DESC')
            .take(50)
            .getMany();

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

        return result
    }
}