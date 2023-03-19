import { ConflictException, HttpException, HttpStatus } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Todo } from "src/entity/todo.entity";
import { CreateAlarmByTimeDto, CreateTodoDto, UpdateTodoDto } from "src/todos/dto/create.todo.dto";
import { UserService } from "src/users/users.service";
import { EntityManager, In, Repository } from "typeorm";
import { SubTodo } from "src/entity/sub-todo.entity";
import { Tag } from "src/entity/tag.entity";
import { DatePaginationDto } from "src/common/dto/date-pagination.dto";
import { fromYYYYMMDDAddOneDayToDate, fromYYYYMMDDToDate } from "src/common/makeDate";
import { TagsService } from "src/tags/tags.service";
import { TagWithTodo } from "src/entity/tag-with-todo.entity";
import { GetByTagDto } from "src/todos/dto/geybytag.todo.dto";
import { Alarm } from "src/entity/alarm.entity";
import { formattedTodoDataFromTagRawQuery, transformTodosAddTags } from "src/common/utils/data-utils";
import { AlarmsService } from "src/alarms/alarms.service";
import { CreateTagDto } from "src/tags/dto/create.tag.dto";
import { CreateSubTodoDto, UpdateSubTodoDto } from "src/todos/dto/create.subtodo.dto";
import { User } from "src/entity/user.entity";
import { UpdateSubTodosOrderDto, UpdateTodosInTagOrderDto, UpdateTodosOrderDto } from "src/todos/dto/order.todo.dto";
import { GetTodosPaginationResponse, GetTodosResponseByTag, GetTodosResponseByDate, TodoResponse, GetTodosForMain, GetTodosResponse } from "src/todos/interface/todo.interface";
import { NotRepeatTodoCompleteDto } from "src/todos/dto/complete.todo.dto";
import { LIMIT_DATA_LENGTH } from "src/common/utils/constants";
import { TodoRepeat } from "src/entity/todo-repeat.entity";


export class TodoRepository {
    constructor(@InjectRepository(Todo) private readonly repository: Repository<Todo>,
        @InjectRepository(SubTodo) private readonly subTodoRepository: Repository<SubTodo>,
        @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
        @InjectRepository(TagWithTodo) private readonly tagWithTodoRepository: Repository<TagWithTodo>,
        @InjectRepository(Alarm) private readonly alarmRepository: Repository<Alarm>,
        @InjectRepository(TodoRepeat) private readonly todoRepeatRepository: Repository<TodoRepeat>,
        private readonly userService: UserService,
        private readonly tagsService: TagsService,
        private readonly alarmsService: AlarmsService,
        @InjectEntityManager() private readonly entityManager: EntityManager,
    ) { }
    private todoProperties = ['todo.id', 'todo.content', 'todo.memo', 'todo.todayTodo', 'todo.flag', 'todo.repeatEnd', 'todo.isSelectedEndDateTime', 'todo.endDate', 'todo.todoOrder', 'todo.completed', 'todo.createdAt', 'todo.updatedAt']
    private subTodoProperties = ['subtodo.id', 'subtodo.content', 'subtodo.subTodoOrder', 'subtodo.completed']
    private alarmProperties = ['alarm.id', 'alarm.time']
    private tagWithTodoProperties = ['tagwithtodo.id']
    private tagProperties = ['tag.id', 'tag.content']
    private todoRepeatProperties = ['todorepeat.id', 'todorepeat.repeatOption', 'todorepeat.repeatValue']

    async findAll(): Promise<Todo[]> {
        return await this.repository.find()
    }

    /* 메인화면에 쓰는 투두 데이터 조회 */
    async findTodosForMain(userId: string): Promise<GetTodosForMain> {
        // /* subtodo, tag 조인, 페이지네이션 */
        const [flaggedTodos, taggedTodos, untaggedTodos, completedTodos] = await Promise.all([
            this.getFlaggedTodosForMain(userId),
            this.getTaggedTodosForMain(userId),
            this.getUnTaggedTodosForMain(userId),
            this.getCompletedTodosForMain(userId)
        ])

        return {
            data: {
                flaggedTodos: flaggedTodos.data,
                taggedTodos: taggedTodos.data,
                untaggedTodos: untaggedTodos.data,
                completedTodos: completedTodos.data,
            }
        };
    }

    async getFlaggedTodosForMain(userId: string): Promise<GetTodosResponse> {
        const flaggedTodos = await this.repository.createQueryBuilder('todo')
            .leftJoinAndSelect('todo.subTodos', 'subtodo')
            .leftJoinAndSelect('todo.alarms', 'alarm')
            .leftJoinAndSelect('todo.tagWithTodos', 'tagwithtodo')
            .leftJoinAndSelect('todo.todoRepeat', 'todorepeat')
            .leftJoinAndSelect('tagwithtodo.tag', 'tag')
            .where('todo.user = :userId', { userId })
            .andWhere('todo.flag = 1')
            .andWhere('todo.completed = 0')
            .take(LIMIT_DATA_LENGTH)
            .select(this.todoProperties)
            .addSelect(this.subTodoProperties)
            .addSelect(this.alarmProperties)
            .addSelect(this.tagWithTodoProperties)
            .addSelect(this.tagProperties)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('subtodo.subTodoOrder', 'ASC')
            .getMany()

        const ret = transformTodosAddTags(flaggedTodos)
        return {
            data: ret
        }
    }

    async getTaggedTodosForMain(userId: string): Promise<GetTodosResponse> {
        const taggedTodos = await this.repository.createQueryBuilder('todo')
            .leftJoinAndSelect('todo.subTodos', 'subtodo')
            .leftJoinAndSelect('todo.alarms', 'alarm')
            .leftJoinAndSelect('todo.tagWithTodos', 'tagwithtodo')
            .leftJoinAndSelect('todo.todoRepeat', 'todorepeat')
            .leftJoinAndSelect('tagwithtodo.tag', 'tag')
            .where('todo.user = :userId', { userId })
            .andWhere('tagwithtodo.id is not null')
            .andWhere('todo.completed = 0')
            .take(LIMIT_DATA_LENGTH)
            .select(this.todoProperties)
            .addSelect(this.subTodoProperties)
            .addSelect(this.alarmProperties)
            .addSelect(this.tagWithTodoProperties)
            .addSelect(this.tagProperties)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('subtodo.subTodoOrder', 'ASC')
            .getMany()
        return {
            data: transformTodosAddTags(taggedTodos)
        }
    }

    async getUnTaggedTodosForMain(userId: string): Promise<GetTodosResponse> {
        const unTaggedTodos = await this.repository.createQueryBuilder('todo')
            .leftJoinAndSelect('todo.subTodos', 'subtodo')
            .leftJoinAndSelect('todo.alarms', 'alarm')
            .leftJoinAndSelect('todo.tagWithTodos', 'tagwithtodo')
            .leftJoinAndSelect('todo.todoRepeat', 'todorepeat')
            .leftJoinAndSelect('tagwithtodo.tag', 'tag')
            .where('todo.user = :userId', { userId })
            .andWhere('tagwithtodo.id is null')
            .andWhere('todo.completed = 0')
            .take(LIMIT_DATA_LENGTH)
            .select(this.todoProperties)
            .addSelect(this.subTodoProperties)
            .addSelect(this.alarmProperties)
            .addSelect(this.tagWithTodoProperties)
            .addSelect(this.tagProperties)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('subtodo.subTodoOrder', 'ASC')
            .getMany()

        return {
            data: transformTodosAddTags(unTaggedTodos)
        }
    }

    async getCompletedTodosForMain(userId: string): Promise<GetTodosResponse> {
        const completedTodos = await this.repository.createQueryBuilder('todo')
            .leftJoinAndSelect('todo.subTodos', 'subtodo')
            .leftJoinAndSelect('todo.alarms', 'alarm')
            .leftJoinAndSelect('todo.tagWithTodos', 'tagwithtodo')
            .leftJoinAndSelect('todo.todoRepeat', 'todorepeat')
            .leftJoinAndSelect('tagwithtodo.tag', 'tag')
            .where('todo.user = :userId', { userId })
            .andWhere('todo.completed = 1')
            .take(LIMIT_DATA_LENGTH)
            .select(this.todoProperties)
            .addSelect(this.subTodoProperties)
            .addSelect(this.alarmProperties)
            .addSelect(this.tagWithTodoProperties)
            .addSelect(this.tagProperties)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('subtodo.subTodoOrder', 'ASC')
            .getMany()

        return {
            data: transformTodosAddTags(completedTodos)
        }
    }



    /* 투두 데이트 페이지네이션 함수 */
    async findByDate(userId: string, datePaginationDto: DatePaginationDto): Promise<GetTodosResponseByDate> {
        const startDate = fromYYYYMMDDToDate(datePaginationDto.startDate)
        const endDate = fromYYYYMMDDAddOneDayToDate(datePaginationDto.endDate)

        const [todos, count] = await this.repository.createQueryBuilder('todo')
            .leftJoinAndSelect('todo.subTodos', 'subtodo')
            .leftJoinAndSelect('todo.alarms', 'alarm')
            .leftJoinAndSelect('todo.tagWithTodos', 'tagwithtodo')
            .leftJoinAndSelect('todo.todoRepeat', 'todorepeat')
            .leftJoinAndSelect('tagwithtodo.tag', 'tag')
            .where('todo.user = :userId', { userId })
            .andWhere('todo.end_date IS NOT NULL')
            .andWhere('((todo.end_date >= :startDate AND todo.end_date < :endDate) OR (todo.repeat_end > :startDate AND todo.repeat_end <= :endDate))')
            .setParameters({ startDate, endDate })
            .select(this.todoProperties)
            .addSelect(this.subTodoProperties)
            .addSelect(this.alarmProperties)
            .addSelect(this.tagWithTodoProperties)
            .addSelect(this.tagProperties)
            .orderBy('todo.end_date', 'ASC')
            .addOrderBy('todo.repeat_end', 'DESC')
            .addOrderBy('todo.created_at', 'ASC')
            .getManyAndCount();

        /* tag 내용 파싱 */
        const result = transformTodosAddTags(todos)
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
    async findByPagination(userId: string, paginationDto: PaginationDto): Promise<GetTodosPaginationResponse> {
        const { page, limit } = paginationDto
        const skip = (page - 1) * limit;

        // /* subtodo, tag 조인, 페이지네이션 */
        const [todos, count] = await this.repository.createQueryBuilder('todo')
            .leftJoinAndSelect('todo.subTodos', 'subtodo')
            .leftJoinAndSelect('todo.alarms', 'alarm')
            .leftJoinAndSelect('todo.tagWithTodos', 'tagwithtodo')
            .leftJoinAndSelect('todo.todoRepeat', 'todorepeat')
            .leftJoinAndSelect('tagwithtodo.tag', 'tag')
            .where('todo.user = :userId', { userId })
            .skip(skip)
            .take(limit)
            .select(this.todoProperties)
            .addSelect(this.subTodoProperties)
            .addSelect(this.alarmProperties)
            .addSelect(this.tagWithTodoProperties)
            .addSelect(this.tagProperties)
            .addSelect(this.todoRepeatProperties)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('subtodo.subTodoOrder', 'ASC')
            .getManyAndCount();

        const totalPages = Math.ceil(count / limit);

        /* tag 내용 파싱 */
        return {
            data: transformTodosAddTags(todos),
            pagination: {
                totalItems: count,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: totalPages,
            },
        };
    }

    /* 완료된 투두 페이지네이션 함수 */
    async findCompletedTodoByPagination(userId: string, paginationDto: PaginationDto): Promise<GetTodosPaginationResponse> {
        const { page, limit } = paginationDto
        const skip = (page - 1) * limit;

        // /* subtodo, tag 조인, 페이지네이션 */
        const [todos, count] = await this.repository.createQueryBuilder('todo')
            .leftJoinAndSelect('todo.subTodos', 'subtodo')
            .leftJoinAndSelect('todo.alarms', 'alarm')
            .leftJoinAndSelect('todo.tagWithTodos', 'tagwithtodo')
            .leftJoinAndSelect('todo.todoRepeat', 'todorepeat')
            .leftJoinAndSelect('tagwithtodo.tag', 'tag')
            .where('todo.user = :userId', { userId })
            .andWhere('todo.completed = 1')
            .skip(skip)
            .take(limit)
            .select(this.todoProperties)
            .addSelect(this.subTodoProperties)
            .addSelect(this.alarmProperties)
            .addSelect(this.tagWithTodoProperties)
            .addSelect(this.tagProperties)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('subtodo.subTodoOrder', 'ASC')
            .getManyAndCount();

        const totalPages = Math.ceil(count / limit);

        return {
            data: transformTodosAddTags(todos),
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
    async findByTagId(userId: string, getByTagDto: GetByTagDto): Promise<GetTodosResponseByTag> {
        const { tagId } = getByTagDto

        const LIMIT = 50
        const [ret, retCompleted] = await Promise.all([
            this.entityManager.query(`
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
                todo_repeat.repeat_option as "todo_repeatOption",
                todo_repeat.repeat_value as "todo_repeatValue",
                todo.is_selected_end_date_time as "todo_isSelectedEndDateTime",
                todo.end_date as "todo_endDate",
                todo.completed as "todo_completed",
                todo.created_At as "todo_created_At",
                todo.updated_At as "todo_updated_At",
                twt.todo_order as "todo_order",
                alarm.id as "alarm_id",
                alarm.time as "alarm_time",
                sub_todo.id as "subTodo_id",
                sub_todo.content as "subTodo_content",
                sub_todo.completed as "subTodo_completed",
                sub_todo.sub_todo_order as "subTodo_order",
                tag.id as "tag_id",
                tag.content as "tag_content"
            FROM dt
            JOIN todo ON dt.id = todo.id
            LEFT JOIN tag_with_todo twt ON dt.id = twt.todo_id
            LEFT JOIN tag ON twt.tag_id = tag.id
            LEFT JOIN alarm ON dt.id = alarm.todo_id
            LEFT JOIN sub_todo ON dt.id = sub_todo.todo_id
            LEFT JOIN todo_repeat ON dt.id = todo_repeat.todo_id
            WHERE todo.completed = 0
            ORDER BY twt.todo_order ASC, subTodo_order ASC
        `, [tagId, userId, LIMIT]),
            this.entityManager.query(`
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
                todo_repeat.repeat_option as "todo_repeatOption",
                todo_repeat.repeat_value as "todo_repeatValue",
                todo.is_selected_end_date_time as "todo_isSelectedEndDateTime",
                todo.end_date as "todo_endDate",
                todo.completed as "todo_completed",
                todo.created_At as "todo_created_At",
                todo.updated_At as "todo_updated_At",
                twt.todo_order as "todo_order",
                alarm.id as "alarm_id",
                alarm.time as "alarm_time",
                sub_todo.id as "subTodo_id",
                sub_todo.content as "subTodo_content",
                sub_todo.completed as "subTodo_completed",
                sub_todo.sub_todo_order as "subTodo_order",
                tag.id as "tag_id",
                tag.content as "tag_content"
            FROM dt
            JOIN todo ON dt.id = todo.id
            LEFT JOIN tag_with_todo twt ON dt.id = twt.todo_id
            LEFT JOIN tag ON twt.tag_id = tag.id
            LEFT JOIN alarm ON dt.id = alarm.todo_id
            LEFT JOIN sub_todo ON dt.id = sub_todo.todo_id
            LEFT JOIN todo_repeat ON dt.id = todo_repeat.todo_id
            WHERE todo.completed = 1
            ORDER BY twt.todo_order ASC, subTodo_order ASC
        `, [tagId, userId, LIMIT])
        ])

        return {
            data: {
                todos: formattedTodoDataFromTagRawQuery(ret, tagId),
                completedTodos: formattedTodoDataFromTagRawQuery(retCompleted, tagId)
            }
        }
    }

    /* 검색 */
    async findTodosBySearch(userId: string, content: string): Promise<TodoResponse[]> {
        const todos = await this.repository.createQueryBuilder('todo')
            .leftJoinAndSelect('todo.subTodos', 'subtodo')
            .leftJoinAndSelect('todo.alarms', 'alarm')
            .leftJoinAndSelect('todo.tagWithTodos', 'tagwithtodo')
            .leftJoinAndSelect('todo.todoRepeat', 'todorepeat')
            .leftJoinAndSelect('tagwithtodo.tag', 'tag')
            .where('todo.user = :userId', { userId })
            .andWhere('(LOWER(todo.content) LIKE LOWER(:searchValue) OR LOWER(tag.content) LIKE LOWER(:searchValue))')
            .andWhere('todo.completed = 0')
            .setParameters({ searchValue: `%${content}%` })
            .select(this.todoProperties)
            .addSelect(this.subTodoProperties)
            .addSelect(this.alarmProperties)
            .addSelect(this.tagWithTodoProperties)
            .addSelect(this.tagProperties)
            .addSelect(this.todoRepeatProperties)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('subtodo.subTodoOrder', 'ASC')
            .take(50)
            .getMany();

        /* tag 내용 파싱 */
        return transformTodosAddTags(todos)
    }


    /* 투두 생성 함수 */
    async create(userId: string, todo: CreateTodoDto): Promise<TodoResponse> {
        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { nextTodoOrder } = await this.userService.updateNextTodoOrder(userId)

            /* 투두 데이터 저장 */
            const { user, deletedAt, ...savedTodo } = await queryRunner.manager.save(Todo, {
                ...todo,
                user: userId,
                todoOrder: nextTodoOrder + 1,
                todayTodoOrder : nextTodoOrder + 1
            });

            const newSubTodos = todo.subTodos.map((subTodo, subTodoOrder) => ({
                todo: savedTodo.id,
                user: userId,
                content: subTodo,
                subTodoOrder,
            }));

            const newAlarms = todo.alarms.map((alarm) => ({
                user: userId,
                todo: savedTodo.id,
                time: alarm,
            }));

            const promises: Promise<any>[] = [
                queryRunner.manager.save(SubTodo, newSubTodos),
                this.tagsService.createTags(userId, { contents: todo.tags }),
                queryRunner.manager.save(Alarm, newAlarms),
            ];

            if (todo.repeatOption) {
                const newTodoRepeat = {
                    todo : savedTodo.id,
                    repeatOption: todo.repeatOption,
                    repeatValue: todo.repeatValue
                };
                promises.push(queryRunner.manager.save(TodoRepeat, newTodoRepeat))
            }

            const [savedSubTodos, savedTags, savedAlarms, savedTodoRepeat] = await Promise.all(promises);
            const retSubTodos = savedSubTodos.map(({ id, content, subTodoOrder }) => ({ id, content, subTodoOrder, completed: false }));
            const retTags = savedTags.map(({ id, content }) => ({ id, content }));
            const retAlarms = savedAlarms.map(({ id, time }) => ({ id, time }));


            let repeatOption = null
            let repeatValue = null
            if(savedTodoRepeat){
                repeatOption = savedTodoRepeat.repeatOption
                repeatValue = savedTodoRepeat.repeatValue
            }

            /* 사용자에 대한 태그와 투두의 정보 저장 */
            const tagWithTodos = savedTags.map(({ id: tag, nextTagWithTodoOrder }) => ({
                todo: savedTodo.id,
                tag,
                user: userId,
                todoOrder: nextTagWithTodoOrder
            }));

            await Promise.all([
                ...savedTags.map((tag) =>
                    queryRunner.manager.update(
                        Tag,
                        { id: tag.id },
                        { nextTagWithTodoOrder: tag.nextTagWithTodoOrder - 1 },
                    ),
                ),
                queryRunner.manager.save(TagWithTodo, tagWithTodos),
            ]);

            await queryRunner.commitTransaction();

            return { id: savedTodo.id, ...savedTodo, subTodos: retSubTodos, tags: retTags, alarms: retAlarms, repeatOption, repeatValue};
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

    async updateSubTodo(userId: string, subTodoId: string, updateSubTodoDto: UpdateSubTodoDto): Promise<SubTodo> {
        const existingSubTodo = await this.subTodoRepository.findOne({ where: { id: subTodoId } });

        if (!existingSubTodo) {
            throw new HttpException(
                'SubTodo not found',
                HttpStatus.NOT_FOUND,
            );
        }

        try {
            const updatedSubTodo = new Todo({
                ...existingSubTodo,
                ...updateSubTodoDto,
            });
            return this.subTodoRepository.save(updatedSubTodo);
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
        const result = await this.repository.delete({
            user: { id: userId },
            id: todoId
        });

        if (result.affected === 0) {
            throw new HttpException(
                `No todo with ID ${todoId} and user with ID ${userId} was found`,
                HttpStatus.NOT_FOUND,
            );
        }

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

        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const savedTodo = await queryRunner.manager.findOne(Todo, { where: { id: todoId } });
            const subTodoOrder = savedTodo.nextSubTodoOrder
            savedTodo.nextSubTodoOrder -= 1;

            const newSubTodo = this.subTodoRepository.create({
                user: new User({ id: userId }),
                todo: todoId,
                content,
                subTodoOrder,
            });

            const [savedSubTodo, updatedTodo] = await Promise.all([
                queryRunner.manager.save(SubTodo, newSubTodo),
                queryRunner.manager.save(Todo, savedTodo),
            ]);

            await queryRunner.commitTransaction();
            return { id: savedSubTodo.id, content, subTodoOrder };
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
            await queryRunner.release()
        }
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


    /* 드래그앤드랍 오더링 */
    async updateTodosOrder(userId: string, updateTodosOrderDto: UpdateTodosOrderDto) {
        const { todoIds } = updateTodosOrderDto
        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const promises = todoIds.map((id, todoOrder) =>
                queryRunner.manager.update(Todo, { id }, { todoOrder })
            );
            await Promise.all(promises);

            // Commit transaction
            await queryRunner.commitTransaction();
        } catch (err) {
            // Rollback transaction on error
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            // Release query runner
            await queryRunner.release();
        }
    }

    /* 태그별 투두 오더링 */
    async updateTodosOrderInTag(userId: string, updateTodosInTagOrderDto: UpdateTodosInTagOrderDto) {
        const { todoIds, tagId } = updateTodosInTagOrderDto

        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const promises = todoIds.map((todoId, todoOrder) =>
                queryRunner.manager.update(TagWithTodo, { todo: todoId, tag: tagId }, { todoOrder })
            );
            await Promise.all(promises);
            // Commit transaction
            await queryRunner.commitTransaction();
        } catch (err) {
            // Rollback transaction on error
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            // Release query runner
            await queryRunner.release();
        }
    }


    async updateSubTodosOrder(userId: string, updateSubTodosOrderDto: UpdateSubTodosOrderDto) {
        const { subTodoIds } = updateSubTodosOrderDto

        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const promises = subTodoIds.map((id, subTodoOrder) => {
                queryRunner.manager.update(SubTodo, { id }, { subTodoOrder })
            })
            await Promise.all(promises);
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }


    /* 투두 완료처리 */
    async updateTodoToComplete(userId: string, todoId: string, notRepeatTodoCompleteDto: NotRepeatTodoCompleteDto): Promise<void> {
        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await Promise.all([
                queryRunner.manager.update(Todo, { id: todoId }, notRepeatTodoCompleteDto),
                queryRunner.manager.update(SubTodo, { todo: todoId }, notRepeatTodoCompleteDto),
            ]);
            // Commit transaction
            await queryRunner.commitTransaction();
        } catch (err) {
            // Rollback transaction on error
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            // Release query runner
            await queryRunner.release();
        }
    }
}


    //     /* transaction */
    //     async updateSubTodosOrder(userId: string, updateSubTodosOrderDto: UpdateSubTodosOrderDto) {

    //         const queryRunner = this.repository.manager.connection.createQueryRunner();
    //         await queryRunner.connect();
    //         await queryRunner.startTransaction();

    //         try {
    //             const promises = todoIds.map((todoId, todoOrder) =>
    //                 queryRunner.manager.update(TagWithTodo, { todo: todoId, tag: tagId }, { todoOrder })
    //             );
    //             await Promise.all(promises);
    //             // Commit transaction
    //             await queryRunner.commitTransaction();
    //         } catch (err) {
    //             // Rollback transaction on error
    //             await queryRunner.rollbackTransaction();
    //             throw err;
    //         } finally {
    //             // Release query runner
    //             await queryRunner.release();
    //         }
    //     }