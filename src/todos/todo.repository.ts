import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Todo } from "src/entity/todo.entity";
import { BaseTodoDto, CreateBaseTodoDto, CreateTodoDto, UpdateSubTodosDtoWhenUpdateTodo } from "src/todos/dto/create.todo.dto";
import { DataSource, EntityManager, In, QueryRunner, Repository } from "typeorm";
import { Subtodo } from "src/entity/subtodo.entity";
import { DatePaginationDto, DateTimePaginationDto, TodayTodoDto } from "src/common/dto/date-pagination.dto";
import { fromYYYYMMDDAddOneDayToDate, fromYYYYMMDDToDate } from "src/common/makeDate";
import { TodoTags } from "src/entity/todo-tags.entity";
import { GetByTagDto } from "src/todos/dto/geybytag.todo.dto";
import { UpdateSubTodosOrderDto, UpdateTodosInTagOrderDto, UpdateTodosOrderDto } from "src/todos/dto/order.todo.dto";
import { GetTodosPaginationResponse, GetTodosResponseByTag, GetTodosResponseByDate, TodoResponse, GetTodosForMain, GetTodayTodosResponse, GetAllTodosResponse } from "src/todos/interface/todo.return.interface";
import { NotRepeatTodoCompleteDto } from "src/todos/dto/repeat.todo.dto";
import { LIMIT_DATA_LENGTH } from "src/common/utils/constants";
import { UpdateSubTodoDto } from "./dto/create.subtodo.dto";
import { todosParseToTodoResponse } from "./todo.util";
import { TodoRepositoryInterface } from "./interface/todo.repository.interface";
import { schedulesParseToTodosResponse } from "src/schedules/schedule.util";
import { Schedule } from "src/entity/schedule.entity";

export class TodoRepository implements TodoRepositoryInterface {
    constructor(@InjectRepository(Todo) private readonly repository: Repository<Todo>,
        @InjectRepository(Schedule) private readonly scheduleRepository: Repository<Schedule>,
        @InjectRepository(Subtodo) private readonly subTodoRepository: Repository<Subtodo>,
        @InjectRepository(TodoTags) private readonly todoTagsRepository: Repository<TodoTags>,
        private readonly dataSource : DataSource
    ) { }

    /* update todoTags */
    /* 트랜잭션 처리 필요 */
    async updateTodoTags(userId: string, todoId: string, tagIds: string[], queryRunner?: QueryRunner): Promise<TodoTags[]> {
        const todoTagsRepository = queryRunner ? queryRunner.manager.getRepository(TodoTags) : this.todoTagsRepository;

        await todoTagsRepository.delete({ user: { id: userId }, todo: { id: todoId } });
        // // Fetch existing todoTags
        // const existingTodoTags = await todoTagsRepository.find({ where: { todo: { id: todoId } }, relations: ['tag'] });

        // // Find tagIds to be deleted and new tagIds to be created
        // const existingTagIds = existingTodoTags.map(todoTag => todoTag.tag.id);
        // const tagIdsToDelete = existingTagIds.filter(tagId => !tagIds.includes(tagId));
        // const newTagIds = tagIds.filter(tagId => !existingTagIds.includes(tagId));

        // // Delete todoTags to be removed
        // if (tagIdsToDelete.length > 0) {
        //     await todoTagsRepository.delete({ todo: { id: todoId }, tag: { id: In(tagIdsToDelete) } });
        // }

        // Create new todoTags
        const createdTodoTags = await this.createTodoTags(userId, todoId, tagIds, queryRunner);

        // Merge existing and new todoTags, excluding the deleted ones
        // const updatedTodoTags = existingTodoTags.filter(todoTag => !tagIdsToDelete.includes(todoTag.tag.id)).concat(createdTodoTags);
        return createdTodoTags;
    }

    /* create subTodos */
    async updateSubTodos(todoId: string, updateSubTodoDto: UpdateSubTodosDtoWhenUpdateTodo, queryRunner? : QueryRunner): Promise<Subtodo[]> {
        const subTodoRepository = queryRunner ? queryRunner.manager.getRepository(Subtodo) : this.subTodoRepository;
        const existingSubTodos = await subTodoRepository.find({ where: { todo: { id: todoId } }});

        const {contents, subTodosCompleted} = updateSubTodoDto;

        if (existingSubTodos.length > 0 && existingSubTodos.length !== contents.length) {
            await subTodoRepository.delete({ todo: { id: todoId }});
        }
    
        if (contents.length === 0) return [];

        const nextSubTodoOrder = await this.findNextSubTodoOrder(todoId)

        const newSubTodos = contents.map((content, index) => {
            if (index < existingSubTodos.length) {
                existingSubTodos[index].todo = new Todo({ id: todoId });
                existingSubTodos[index].content = content;
                existingSubTodos[index].subTodoOrder = nextSubTodoOrder + index;
                existingSubTodos[index].completed = subTodosCompleted[index];
                return existingSubTodos[index];
            } else {
                return subTodoRepository.create({ todo: { id: todoId }, content, subTodoOrder: nextSubTodoOrder + index, completed: subTodosCompleted[index] });
            }
        });
        return await subTodoRepository.save(newSubTodos)
    }


    async updateSubTodosToUnCompleteByTodoId(todoId: string, queryRunner?: QueryRunner): Promise<Subtodo[]> {
        const subTodoRepository = queryRunner ? queryRunner.manager.getRepository(Subtodo) : this.subTodoRepository;
        const subTodos = await subTodoRepository.find({ where: { todo: { id: todoId } }});
        if (subTodos.length === 0) return [];

        const updatedSubTodos = subTodos.map(subTodo => {
            subTodo.completed = false;
            return subTodo;
        });

        return await subTodoRepository.save(updatedSubTodos);
    }
    
    /* update todo */
    async updateTodo(userId: string, todoId: string, baseTodoDto: Partial<BaseTodoDto>, queryRunner?: QueryRunner): Promise<Todo> {
        const todoRepository = queryRunner ? queryRunner.manager.getRepository(Todo) : this.repository;

        // Find existing todo and update with new data
        const existingTodo = await todoRepository.findOne({ where : { id: todoId, user: { id: userId } }});
        if(!existingTodo) throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);

        
        const updateTodo = todoRepository.create({ ...existingTodo, ...baseTodoDto });
        return await todoRepository.save(updateTodo);
    }

    // todo find by todoId
    async findTodoWithScheduleIdByTodoId(todoId: string): Promise<Todo> {
        return await this.repository.findOne({ where: { id: todoId }, relations: ['schedule', 'todoTags', 'subTodos', 'todoTags.tag', 'schedule.parent', 'schedule.alarms'] });
    }

    /* create todoTags */
    async createTodoTags(userId: string, todoId: string, tagIds: string[], queryRunner? : QueryRunner): Promise<TodoTags[]> {
        console.log('createTodoTags', tagIds)
        
        if(tagIds.length === 0) return [];

        
        const todoTagsRepository = queryRunner ? queryRunner.manager.getRepository(TodoTags) : this.todoTagsRepository;

        // in todoTags, group by tag_id and get max value per tag_id
        const maxTodoOrderPerTagId = await this.todoTagsRepository.createQueryBuilder('todoTags')
            .select('MAX(todoTags.todoOrder)', 'maxTodoOrder')
            .addSelect('todoTags.tag', 'tag')
            .where('todoTags.tag IN (:...tagIds)', { tagIds })
            .groupBy('todoTags.tag')
            .getRawMany();
        
        // make dictionary with tagId as key and maxTodoOrder as value
        const maxTodoOrderPerTagIdDict = maxTodoOrderPerTagId.reduce((acc, cur) => {
            acc[cur.tag] = cur.maxTodoOrder + 1;
            return acc;
        }, {})

        const todoTagsEntities = tagIds.map((tagId,index) => {
            return todoTagsRepository.create({user: {id:userId}, todo: { id: todoId }, tag: { id: tagId }, todoOrder: maxTodoOrderPerTagIdDict[tagId], tagOrder: index})
        })

        return await todoTagsRepository.save(todoTagsEntities);
    }

    /* 투두 생성 함수 */
    async createTodo(userId: string, scheduleId: string, createBaseTodoDto: CreateBaseTodoDto, queryRunner? : QueryRunner): Promise<Todo> {
        const todoRepository = queryRunner ? queryRunner.manager.getRepository(Todo) : this.repository;

        //find next todo order and today todo order by Promise.all
        const nextTodoOrder = await this.findNextTodoOrder(userId)
        const todo = todoRepository.create({ user: { id: userId }, schedule: { id: scheduleId }, ...createBaseTodoDto, todoOrder: nextTodoOrder, todayTodoOrder: nextTodoOrder });
        const savedTodo = await todoRepository.save(todo);
        
        return savedTodo
    }

    /* create subTodos */
    async createSubTodos(todoId: string, contents: string[], queryRunner? : QueryRunner): Promise<Subtodo[]> {
        if(contents.length === 0) return [];

        const subTodoRepository = queryRunner ? queryRunner.manager.getRepository(Subtodo) : this.subTodoRepository;

        const nextSubTodoOrder = await this.findNextSubTodoOrder(todoId)
        const subTodoEntities = contents.map((content, index) => {
            return subTodoRepository.create({content, todo: { id: todoId }, subTodoOrder: nextSubTodoOrder + index})
        })
        return await subTodoRepository.save(subTodoEntities);
    }

    /* create subTodos */
    async createSubTodosForUpdateBySplit(todoId: string, contents: string[], subTodosCompleted:boolean[], queryRunner? : QueryRunner): Promise<Subtodo[]> {
        if(contents.length === 0) return [];

        const subTodoRepository = queryRunner ? queryRunner.manager.getRepository(Subtodo) : this.subTodoRepository;

        const nextSubTodoOrder = await this.findNextSubTodoOrder(todoId)
        const subTodoEntities = contents.map((content, index) => {
            return subTodoRepository.create({content, todo: { id: todoId }, subTodoOrder: nextSubTodoOrder + index, completed: subTodosCompleted[index]})
        })
        return await subTodoRepository.save(subTodoEntities);
    }

    async findNextSubTodoOrder(todoId: string): Promise<number> {
        const maxSubTodoOrder = await this.subTodoRepository.createQueryBuilder('subtodo')
            .select('MAX(subtodo.subTodoOrder)', 'maxSubTodoOrder')
            .where('subtodo.todo = :todoId', { todoId })
            .getRawOne();

        return maxSubTodoOrder.maxSubTodoOrder + 1;
    }

    // find Next Todo Order
    async findNextTodoOrder(userId: string): Promise<number> {
        const maxTodoOrder = await this.repository.createQueryBuilder('todo')
            .select('MAX(todo.todoOrder)', 'maxTodoOrder')
            .where('todo.user = :userId', { userId })
            .getRawOne();
        return maxTodoOrder.maxTodoOrder + 1;
    }

    // find Next Today Todo Order
    async findNextTodayTodoOrder(userId: string): Promise<number> {
        const maxTodayTodoOrder = await this.repository.createQueryBuilder('todo')
            .select('MAX(todo.todayTodoOrder)', 'maxTodayTodoOrder')
            .where('todo.user = :userId', { userId })
            .andWhere('todo.todayTodo = true')
            .getRawOne();
        return maxTodayTodoOrder.maxTodayTodoOrder + 1;
    }


    /* 투두 메인화면 + 투데이 투두 */
    async findTodosAll(userId: string, todayTodoDto: TodayTodoDto): Promise<GetAllTodosResponse> {
        const [mainTodos, todayTodos] = await Promise.all([
            this.findTodosForMain(userId),
            this.findTodayTodos(userId, todayTodoDto)
        ])

        return {
            data: {
                flaggedTodos: mainTodos.data.flaggedTodos,
                taggedTodos: mainTodos.data.taggedTodos,
                untaggedTodos: mainTodos.data.untaggedTodos,
                completedTodos: mainTodos.data.completedTodos,
                todayTodos: todayTodos.data.todayTodos,
                todayFlaggedTodos: todayTodos.data.flaggedTodos,
                endDatedTodos: todayTodos.data.endDatedTodos,
            }
        };
    }

    /* 메인화면에 쓰는 투두 데이터 조회 */
    async findTodosForMain(userId: string): Promise<GetTodosForMain> {
        // /* subtodo, tag 조인, 페이지네이션 */
        const [flaggedTodos, taggedTodos, untaggedTodos, completedTodos] = await Promise.all([
            this.findFlaggedTodosForMain(userId),
            this.findTaggedTodosForMain(userId),
            this.findUnTaggedTodosForMain(userId),
            this.findCompletedTodosForMain(userId)
        ])

        return {
            data: {
                flaggedTodos: flaggedTodos,
                taggedTodos: taggedTodos,
                untaggedTodos: untaggedTodos,
                completedTodos: completedTodos,
            }
        };
    }

    getBaseQueryBuilderTodos(userId: string) {
        return this.repository.createQueryBuilder('todo')
            .addSelect('user.id', 'user_id')
            .innerJoinAndSelect('todo.schedule', 'schedule')
            .innerJoin('todo.user', 'user')
            .leftJoinAndSelect('schedule.parent', 'parent')
            .leftJoinAndSelect('schedule.alarms', 'alarms')
            .leftJoinAndSelect('todo.todoTags', 'todoTags')
            .leftJoinAndSelect('todoTags.tag', 'tag')
            .leftJoinAndSelect('todo.subTodos', 'subTodos')
            .where('todo.user = :userId', { userId })
    }

    async findFlaggedTodosForMain(userId: string): Promise<TodoResponse[]> {
        const flaggedTodos = await this.getBaseQueryBuilderTodos(userId)
            .andWhere('todo.flag = 1')
            .andWhere('todo.completed = 0')
            .take(LIMIT_DATA_LENGTH)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('todoTags.tagOrder', 'ASC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .getMany()

        return todosParseToTodoResponse(flaggedTodos)
    }

    async findTaggedTodosForMain(userId: string): Promise<TodoResponse[]> {
        const taggedTodos = await this.getBaseQueryBuilderTodos(userId)
            .andWhere('todo.flag = 0')
            .andWhere('todo.completed = 0')
            .andWhere('todoTags.id is not null')
            .take(LIMIT_DATA_LENGTH)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('todoTags.tagOrder', 'ASC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .getMany()

        console.log(taggedTodos)
        return todosParseToTodoResponse(taggedTodos)
    }

    async findUnTaggedTodosForMain(userId: string): Promise<TodoResponse[]> {
        const unTaggedTodos = await this.getBaseQueryBuilderTodos(userId)
            .andWhere('todo.flag = 0')
            .andWhere('(todo.id NOT IN (select distinct(todo_id) from todo_tags where todo_tags.user_id = :userId))', { userId })
            .andWhere('todo.completed = 0')
            .take(LIMIT_DATA_LENGTH)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('todoTags.tagOrder', 'ASC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .getMany()

        return todosParseToTodoResponse(unTaggedTodos)
    }

    async findCompletedTodosForMain(userId: string): Promise<TodoResponse[]> {
        const completedTodos = await this.getBaseQueryBuilderTodos(userId)
            .andWhere('todo.completed = 1')
            .take(LIMIT_DATA_LENGTH)
            .orderBy('todo.updatedAt', 'DESC')
            .addOrderBy('todoTags.tagOrder', 'ASC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .getMany()

        return todosParseToTodoResponse(completedTodos)
    }

    /* 오늘의 할일 */
    async findTodayTodos(userId: string, todayTodoDto: TodayTodoDto): Promise<GetTodayTodosResponse> {
        const {endDate} = todayTodoDto

        const flaggedTodos = await this.getBaseQueryBuilderTodos(userId)
            .andWhere('todo.flag = 1')
            .andWhere('(todo.todayTodo = 1 OR schedule.repeat_start <= :endDate)', { endDate })
            .andWhere('todo.completed = 0')
            .take(LIMIT_DATA_LENGTH)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('todoTags.tagOrder', 'ASC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .getMany()
        
        const todayTodos = await this.getBaseQueryBuilderTodos(userId)
            .andWhere('todo.flag = 0')
            .andWhere('todo.todayTodo = 1')
            .andWhere('todo.completed = 0')
            .take(LIMIT_DATA_LENGTH)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('todoTags.tagOrder', 'ASC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .getMany()

        const endDatedTodos = await this.getBaseQueryBuilderTodos(userId)
            .andWhere('todo.flag = 0')
            .andWhere('todo.todayTodo = 0')
            .andWhere('todo.completed = 0')
            .andWhere('schedule.repeat_start <= :endDate', { endDate })
            .take(LIMIT_DATA_LENGTH)
            .orderBy('schedule.repeatStart', 'DESC')
            .addOrderBy('todoTags.tagOrder', 'ASC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .getMany()

        const completedTodos = await this.getBaseQueryBuilderTodos(userId)
            .andWhere('(todo.todayTodo = 1 OR schedule.repeat_start <= :endDate)', { endDate })
            .andWhere('todo.completed = 1')
            .take(LIMIT_DATA_LENGTH)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('todoTags.tagOrder', 'ASC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .getMany()

        return {
            data: {
                flaggedTodos: todosParseToTodoResponse(flaggedTodos),
                todayTodos: todosParseToTodoResponse(todayTodos),
                endDatedTodos: todosParseToTodoResponse(endDatedTodos),
                completedTodos: todosParseToTodoResponse(completedTodos)
            }
        }
    }

    /* 투두 데이트 페이지네이션 함수 */
    async findByDateTime(userId: string, dateTimePaginationDto: DateTimePaginationDto): Promise<GetTodosResponseByDate> {
        const { startDate, endDate } = dateTimePaginationDto

        //make query that schedule that is todo_id is null
        const [todos, count] = await this.scheduleRepository.createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.category', 'category')
            .leftJoinAndSelect('schedule.alarms', 'alarm')
            .leftJoinAndSelect('schedule.todo', 'todo')
            .leftJoinAndSelect('todo.todoTags', 'todoTags')
            .leftJoinAndSelect('todoTags.tag', 'tag')
            .leftJoinAndSelect('todo.subTodos', 'subTodos')
            .where('schedule.user = :userId', { userId })
            .andWhere('schedule.todo IS NOT NULL AND todo.completed = 0')
            .andWhere('((schedule.repeat_start >= :startDate AND schedule.repeat_start < :endDate) \
            OR (schedule.repeat_end > :startDate AND schedule.repeat_end <= :endDate) \
            OR (schedule.repeat_start <= :startDate AND schedule.repeat_end >= :endDate) \
            OR (schedule.repeat_option IS NOT NULL AND schedule.repeat_start <= :endDate AND schedule.repeat_end IS NULL))')
            .setParameters({ startDate, endDate })
            .orderBy('schedule.repeat_start', 'ASC')
            .addOrderBy('schedule.repeat_end', 'DESC')
            .addOrderBy('schedule.created_at', 'ASC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .getManyAndCount()

        return {
            data: schedulesParseToTodosResponse(todos),
            pagination: {
                totalItems: count,
                startDate,
                endDate
            },
        };
    }

    async findStatisticsByDateTime(userId: string, dateTimePaginationDto: DateTimePaginationDto): Promise<any> {
        const { startDate, endDate } = dateTimePaginationDto

        const [todos, count] = await this.scheduleRepository.createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.todo', 'todo')
            .where('schedule.user_id = :userId', { userId })
            .andWhere('schedule.parent IS NULL')
            .andWhere('((todo.created_at >= :startDate AND todo.created_at < :endDate) \
            OR (todo.completed_at > :startDate AND todo.completed_at <= :endDate))')
            .setParameters({ startDate, endDate })
            .getManyAndCount()

        //count completed todo by date
        let completed = 0
        todos.forEach(todo => {
            if(todo.todo.completed) {
                completed++
            }
        })

        return {
            completed,
            totalItems: count,
            startDate,
            endDate
        };
    }

    /* 투두 페이지네이션 함수 */
    async findByPagination(userId: string, paginationDto: PaginationDto): Promise<GetTodosPaginationResponse> {
        const { page, limit } = paginationDto
        const skip = (page - 1) * limit;

        const [todos, count] = await this.getBaseQueryBuilderTodos(userId)
            .skip(skip)
            .take(limit)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('todoTags.tagOrder', 'ASC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .getManyAndCount();
            
        const totalPages = Math.ceil(count / limit);

        /* tag 내용 파싱 */
        return {
            data: todosParseToTodoResponse(todos),
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

        const [todos, count] = await this.getBaseQueryBuilderTodos(userId)
            .andWhere('todo.completed = 1')
            .skip(skip)
            .take(limit)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('todoTags.tagOrder', 'ASC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .getManyAndCount();

        console.log(todos)
        
        const totalPages = Math.ceil(count / limit);

        return {
            data: todosParseToTodoResponse(todos),
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
        const todos = await this.getBaseQueryBuilderTodos(userId)
            .andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select('todoTag.todo')
                    .from('todo_tags', 'todoTag')
                    .leftJoin('todoTag.tag', 'tag')
                    .where('tag.id = :tagId', { tagId })
                    .getQuery();
                return 'todo.id IN ' + subQuery;
            })
            .getMany()
    
        const parsedTodos = todosParseToTodoResponse(todos)
        const unCompleted = parsedTodos.filter(todo => !todo.completed);
        const flaggedTodos = unCompleted.filter(todo => todo.flag);
        const unFlaggedTodos = unCompleted.filter(todo => !todo.flag);
        const completedTodos = parsedTodos.filter(todo => todo.completed);
        
        return {
            data: {
                flaggedTodos ,
                unFlaggedTodos,
                completedTodos
            }
        }
    }

    async updateSubTodo(userId: string, subTodoId: string, updateSubTodoDto: UpdateSubTodoDto): Promise<Subtodo> {
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

    /* 드래그앤드랍 오더링 */
    async updateTodosOrder(userId: string, updateTodosOrderDto: UpdateTodosOrderDto) :Promise<void> {
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

    /* 드래그앤드랍 투데이 투두 오더링 */
    async updateTodayTodosOrder(userId: string, updateTodosOrderDto: UpdateTodosOrderDto) :Promise<void> {
        const { todoIds } = updateTodosOrderDto
        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const promises = todoIds.map((id, todayTodoOrder) =>
                queryRunner.manager.update(Todo, { id }, { todayTodoOrder })
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
    async updateTodosOrderInTag(userId: string, updateTodosInTagOrderDto: UpdateTodosInTagOrderDto):Promise<void> {
        const { todoIds, tagId } = updateTodosInTagOrderDto

        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const promises = todoIds.map((todoId, todoOrder) =>
                queryRunner.manager.update(TodoTags, { todo: todoId, tag: tagId }, { todoOrder })
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


    async updateSubTodosOrder(userId: string, updateSubTodosOrderDto: UpdateSubTodosOrderDto):Promise<void> {
        const { subTodoIds } = updateSubTodosOrderDto

        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const promises = subTodoIds.map((id, subTodoOrder) => {
                queryRunner.manager.update(Subtodo, { id }, { subTodoOrder })
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

    async resetParentIdOfTodos(parentTodoId : string){
        //get all todos that have parentTodoId
        const schedules = await this.scheduleRepository.find({where: {parent: {id: parentTodoId}}})

        
        if(schedules.length == 0){
            return
        }else if(schedules.length == 1){
            const schedule = schedules[0]
            schedule.parent = null
            await this.scheduleRepository.save(schedule)
            return
        }

        //sort by schedules end date
        const sortedSchedules = schedules.sort((a,b) => {
            if(a.repeatEnd === null) return 1
            if(b.repeatEnd === null) return -1
            return b.repeatEnd.getTime() - a.repeatEnd.getTime()
        })

        console.log(sortedSchedules)

        // change all sortedSchedules parent to sortedSchedules[0] and sortedSchedule[0] parent to null
        const promises = sortedSchedules.map((schedule, index) => {
            if(index === 0){
                schedule.parent = null
            }else{
                schedule.parent = sortedSchedules[0]
            }
            return this.scheduleRepository.save(schedule)
        }
        )
        await Promise.all(promises)
    }

    /* 미반복 투두 완료처리 */
    async updateUnRepeatTodoToComplete(todoId: string, notRepeatTodoCompleteDto: NotRepeatTodoCompleteDto, queryRunner?: QueryRunner): Promise<void> {
        const shouldReleaseQueryRunner = !queryRunner;

        if (shouldReleaseQueryRunner) {
            queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
        }

        const todoRepository = queryRunner.manager.getRepository(Todo);
        const subtodoRepository = queryRunner.manager.getRepository(Subtodo);

        await queryRunner.startTransaction();
        try {
            await Promise.all([
                todoRepository.update({ id: todoId }, { ...notRepeatTodoCompleteDto, completedAt: new Date() }),
                subtodoRepository.update({ todo: { id: todoId } }, notRepeatTodoCompleteDto),
                this.resetParentIdOfTodos(todoId)
            ]);
            // Commit transaction
            await queryRunner.commitTransaction();
        } catch (err) {
            // Rollback transaction on error
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            // Release query runner
            if (shouldReleaseQueryRunner) {
                await queryRunner.release();
            }
        }
    }

    //deleteTodo by todo Id
    async deleteTodoById(userId: string, todoId: string): Promise<void> {
        const result = await this.repository.delete({ id: todoId });

        if (result.affected === 0) {
            throw new HttpException(
                `No todo with ID ${todoId} associated with user with ID ${userId} was found`,
                HttpStatus.NOT_FOUND,
            );
        }
    }

    /* 투두에서 서브 투두를 지우는 함수 */
    async deleteSubTodoOfTodo(userId: string,
        todoId: string, subTodoId: string): Promise<void> {
        const result = await this.subTodoRepository.delete({id: subTodoId})

        if (result.affected === 0) {
            throw new HttpException(
                `No subTodo with ID ${subTodoId} associated with todo with ID ${todoId} and user with ID ${userId} was found`,
                HttpStatus.NOT_FOUND,
            );
        }
    }

}