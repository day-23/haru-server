import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Todo } from "src/entity/todo.entity";
import { CreateBaseTodoDto, CreateTodoDto, UpdateBaseTodoDto, UpdateSubTodosDtoWhenUpdateTodo } from "src/todos/dto/create.todo.dto";
import { EntityManager, In, QueryRunner, Repository } from "typeorm";
import { Subtodo } from "src/entity/subtodo.entity";
import { DatePaginationDto, TodayTodoDto } from "src/common/dto/date-pagination.dto";
import { fromYYYYMMDDAddOneDayToDate, fromYYYYMMDDToDate } from "src/common/makeDate";
import { TodoTags } from "src/entity/todo-tags.entity";
import { GetByTagDto } from "src/todos/dto/geybytag.todo.dto";
import { formattedTodoDataFromTagRawQuery } from "src/common/utils/data-utils";
import { UpdateSubTodosOrderDto, UpdateTodosInTagOrderDto, UpdateTodosOrderDto } from "src/todos/dto/order.todo.dto";
import { GetTodosPaginationResponse, GetTodosResponseByTag, GetTodosResponseByDate, TodoResponse, GetTodosForMain, GetTodayTodosResponse } from "src/todos/interface/todo.interface";
import { NotRepeatTodoCompleteDto } from "src/todos/dto/complete.todo.dto";
import { LIMIT_DATA_LENGTH } from "src/common/utils/constants";
import { UpdateSubTodoDto } from "./dto/create.subtodo.dto";
import { todosParseToTodoResponse } from "./todo.util";
import { TodoRepositoryInterface } from "./interface/todo.repository.interface";

export class TodoRepository implements TodoRepositoryInterface {
    constructor(@InjectRepository(Todo) private readonly repository: Repository<Todo>,
        @InjectRepository(Subtodo) private readonly subTodoRepository: Repository<Subtodo>,
        @InjectRepository(TodoTags) private readonly todoTagsRepository: Repository<TodoTags>,
    ) { }
    

    /* update todoTags */
    async updateTodoTags(userId: string, todoId: string, tagIds: string[], queryRunner?: QueryRunner): Promise<TodoTags[]> {
        const todoTagsRepository = queryRunner ? queryRunner.manager.getRepository(TodoTags) : this.todoTagsRepository;

        // Fetch existing todoTags
        const existingTodoTags = await todoTagsRepository.find({ where: { todo: { id: todoId } }, relations: ['tag'] });

        // Find tagIds to be deleted and new tagIds to be created
        const existingTagIds = existingTodoTags.map(todoTag => todoTag.tag.id);
        const tagIdsToDelete = existingTagIds.filter(tagId => !tagIds.includes(tagId));
        const newTagIds = tagIds.filter(tagId => !existingTagIds.includes(tagId));

        // Delete todoTags to be removed
        if (tagIdsToDelete.length > 0) {
            await todoTagsRepository.delete({ todo: { id: todoId }, tag: { id: In(tagIdsToDelete) } });
        }

        // Create new todoTags
        const createdTodoTags = await this.createTodoTags(userId, todoId, newTagIds, queryRunner);

        // Merge existing and new todoTags, excluding the deleted ones
        const updatedTodoTags = existingTodoTags.filter(todoTag => !tagIdsToDelete.includes(todoTag.tag.id)).concat(createdTodoTags);
        return updatedTodoTags;
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
                existingSubTodos[index].content = content;
                existingSubTodos[index].subTodoOrder = nextSubTodoOrder + index;
                existingSubTodos[index].completed = subTodosCompleted[index];
                return existingSubTodos[index];
            } else {
                return subTodoRepository.create({ todo: { id: todoId }, content, subTodoOrder: nextSubTodoOrder + index, completed: subTodosCompleted[index] });
            }
        });
        
        return await subTodoRepository.save(newSubTodos);
    }
    
    /* update todo */
    async updateTodo(userId: string, todoId: string, updateBaseTodoDto: UpdateBaseTodoDto, queryRunner?: QueryRunner): Promise<Todo> {
        const todoRepository = queryRunner ? queryRunner.manager.getRepository(Todo) : this.repository;

        // Find existing todo and update with new data
        const existingTodo = await todoRepository.findOne({ where : { id: todoId, user: { id: userId } }});
        if(!existingTodo) throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);

        const updateTodo = todoRepository.create({ ...existingTodo, ...updateBaseTodoDto });
        return await todoRepository.save(updateTodo);
    }

    // todo find by todoId
    async findTodoWithScheduleIdByTodoId(todoId: string): Promise<Todo> {
        //get all relations
        return await this.repository.findOne({ where: { id: todoId }, relations: ['schedule', 'todoTags', 'subTodos', 'todoTags.tag'] });
        
    }

    /* create todoTags */
    async createTodoTags(userId: string, todoId: string, tagIds: string[], queryRunner? : QueryRunner): Promise<TodoTags[]> {
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

        const todoTagsEntities = tagIds.map(tagId => {
            return todoTagsRepository.create({user: {id:userId}, todo: { id: todoId }, tag: { id: tagId }, todoOrder: maxTodoOrderPerTagIdDict[tagId]})
        })

        return await todoTagsRepository.save(todoTagsEntities);
    }

    /* 투두 생성 함수 */
    async createTodo(userId: string, scheduleId: string, createBaseTodoDto: CreateBaseTodoDto, queryRunner? : QueryRunner): Promise<Todo> {
        const todoRepository = queryRunner ? queryRunner.manager.getRepository(Todo) : this.repository;
    
        //find next todo order and today todo order by Promise.all
        const nextTodoOrder = await this.findNextTodoOrder(userId)
        const todo = todoRepository.create({ user: { id: userId }, schedule: { id: scheduleId }, ...createBaseTodoDto, todoOrder: nextTodoOrder, todayTodoOrder: nextTodoOrder });
        return await todoRepository.save(todo);
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

    async findNextSubTodoOrder(todoId: string): Promise<number> {
        const maxSubTodoOrder = await this.subTodoRepository.createQueryBuilder('subtodo')
            .select('MAX(subtodo.subTodoOrder)', 'maxSubTodoOrder')
            .where('subtodo.todo = :todoId', { todoId })
            .getRawOne();

        console.log('maxSubTodoOrder', maxSubTodoOrder)
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
    async findTodosAll(userId: string, todayTodoDto: TodayTodoDto) {
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
            this.getUnTaggedTodosForMain(userId),
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

    async findFlaggedTodosForMain(userId: string): Promise<TodoResponse[]> {
        const flaggedTodos = await this.repository.createQueryBuilder('todo')
            .innerJoinAndSelect('todo.schedule', 'schedule')
            .leftJoinAndSelect('schedule.alarms', 'alarms')
            .leftJoinAndSelect('todo.todoTags', 'todoTags')
            .leftJoinAndSelect('todoTags.tag', 'tag')
            .leftJoinAndSelect('todo.subTodos', 'subTodos')
            .where('todo.user = :userId', { userId })
            .andWhere('todo.flag = 1')
            .andWhere('todo.completed = 0')
            .take(LIMIT_DATA_LENGTH)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .getMany()

        return todosParseToTodoResponse(flaggedTodos)
    }

    async findTaggedTodosForMain(userId: string): Promise<TodoResponse[]> {
        const taggedTodos = await this.repository.createQueryBuilder('todo')
            .innerJoinAndSelect('todo.schedule', 'schedule')
            .leftJoinAndSelect('schedule.alarms', 'alarms')
            .leftJoinAndSelect('todo.todoTags', 'todoTags')
            .leftJoinAndSelect('todoTags.tag', 'tag')
            .leftJoinAndSelect('todo.subTodos', 'subTodos')
            .where('todo.user = :userId', { userId })
            .andWhere('todo.flag = 0')
            .andWhere('todoTags.id is not null')
            .take(LIMIT_DATA_LENGTH)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .getMany()

        return todosParseToTodoResponse(taggedTodos)
    }

    async getUnTaggedTodosForMain(userId: string): Promise<TodoResponse[]> {
        const unTaggedTodos = await this.repository.createQueryBuilder('todo')
            .innerJoinAndSelect('todo.schedule', 'schedule')
            .leftJoinAndSelect('schedule.alarms', 'alarms')
            .leftJoinAndSelect('todo.todoTags', 'todoTags')
            .leftJoinAndSelect('todoTags.tag', 'tag')
            .leftJoinAndSelect('todo.subTodos', 'subTodos')
            .where('todo.user = :userId', { userId })
            .andWhere('todo.flag = 0')
            .andWhere('(todo.id NOT IN (select distinct(todo_id) from todo_tags where todo_tags.user_id = :userId))', { userId })
            .andWhere('todo.completed = 0')
            .take(LIMIT_DATA_LENGTH)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .getMany()

        return todosParseToTodoResponse(unTaggedTodos)
    }

    async findCompletedTodosForMain(userId: string): Promise<TodoResponse[]> {
        const completedTodos = await this.repository.createQueryBuilder('todo')
            .innerJoinAndSelect('todo.schedule', 'schedule')
            .leftJoinAndSelect('schedule.alarms', 'alarms')
            .leftJoinAndSelect('todo.todoTags', 'todoTags')
            .leftJoinAndSelect('todoTags.tag', 'tag')
            .leftJoinAndSelect('todo.subTodos', 'subTodos')
            .where('todo.user = :userId', { userId })
            .andWhere('todo.completed = 1')
            .take(LIMIT_DATA_LENGTH)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .getMany()

        return todosParseToTodoResponse(completedTodos)
    }

    /* 오늘의 할일 */
    async findTodayTodos(userId: string, date: TodayTodoDto): Promise<GetTodayTodosResponse> {
        const endDate = fromYYYYMMDDAddOneDayToDate(date.endDate)

        const flaggedTodos = await this.repository.createQueryBuilder('todo')
            .innerJoinAndSelect('todo.schedule', 'schedule')
            .leftJoinAndSelect('schedule.alarms', 'alarms')
            .leftJoinAndSelect('todo.todoTags', 'todoTags')
            .leftJoinAndSelect('todoTags.tag', 'tag')
            .leftJoinAndSelect('todo.subTodos', 'subTodos')
            .where('todo.user = :userId', { userId })
            .andWhere('todo.flag = 1')
            .andWhere('(todo.todayTodo = 1 OR schedule.repeat_start <= :endDate)', { endDate: endDate.toISOString() })
            .andWhere('todo.completed = 0')
            .take(LIMIT_DATA_LENGTH)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .getMany()
        
        const todayTodos = await this.repository.createQueryBuilder('todo')
            .innerJoinAndSelect('todo.schedule', 'schedule')
            .leftJoinAndSelect('schedule.alarms', 'alarms')
            .leftJoinAndSelect('todo.todoTags', 'todoTags')
            .leftJoinAndSelect('todoTags.tag', 'tag')
            .leftJoinAndSelect('todo.subTodos', 'subTodos')
            .where('todo.user = :userId', { userId })
            .andWhere('todo.flag = 0')
            .andWhere('todo.todayTodo = 1')
            .andWhere('todo.completed = 0')
            .take(LIMIT_DATA_LENGTH)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .getMany()

        const endDatedTodos = await this.repository.createQueryBuilder('todo')
            .innerJoinAndSelect('todo.schedule', 'schedule')
            .leftJoinAndSelect('schedule.alarms', 'alarms')
            .leftJoinAndSelect('todo.todoTags', 'todoTags')
            .leftJoinAndSelect('todoTags.tag', 'tag')
            .leftJoinAndSelect('todo.subTodos', 'subTodos')
            .where('todo.user = :userId', { userId })
            .andWhere('todo.flag = 0')
            .andWhere('todo.todayTodo = 0')
            .andWhere('todo.completed = 0')
            .andWhere('schedule.repeat_start <= :endDate', { endDate: endDate.toISOString() })
            .take(LIMIT_DATA_LENGTH)
            .orderBy('schedule.repeatStart', 'DESC')
            .getMany()

        return {
            data: {
                flaggedTodos: todosParseToTodoResponse(flaggedTodos),
                todayTodos: todosParseToTodoResponse(todayTodos),
                endDatedTodos: todosParseToTodoResponse(endDatedTodos)
            }
        }
    }

    /* 투두 데이트 페이지네이션 함수 */
    async findByDate(userId: string, datePaginationDto: DatePaginationDto): Promise<GetTodosResponseByDate> {
        const startDate = fromYYYYMMDDToDate(datePaginationDto.startDate)
        const endDate = fromYYYYMMDDAddOneDayToDate(datePaginationDto.endDate)

        // todo and schedule, alarm inner join and pagination
        const [todos, count] = await this.repository.createQueryBuilder('todo')
            .innerJoinAndSelect('todo.schedule', 'schedule')
            .leftJoinAndSelect('schedule.alarms', 'alarms')
            .leftJoinAndSelect('todo.todoTags', 'todoTags')
            .leftJoinAndSelect('todoTags.tag', 'tag')
            .leftJoinAndSelect('todo.subTodos', 'subTodos')
            .where('todo.user = :userId', { userId })
            .andWhere('schedule.repeat_start IS NOT NULL')
            .andWhere('(schedule.repeat_start >= :startDate AND schedule.repeat_start < :endDate) OR (schedule.repeat_end > :startDate AND schedule.repeat_end <= :endDate)')
            .setParameters({ startDate, endDate })
            .orderBy('schedule.repeat_start', 'ASC')
            .addOrderBy('schedule.repeat_end', 'DESC')
            .addOrderBy('schedule.created_at', 'ASC')
            .orderBy('subTodos.subTodoOrder', 'ASC')
            .getManyAndCount();
            
        return {
            data: todosParseToTodoResponse(todos),
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

        const [todos, count] = await this.repository.createQueryBuilder('todo')
            .innerJoinAndSelect('todo.schedule', 'schedule')
            .leftJoinAndSelect('schedule.alarms', 'alarms')
            .leftJoinAndSelect('todo.todoTags', 'todoTags')
            .leftJoinAndSelect('todoTags.tag', 'tag')
            .leftJoinAndSelect('todo.subTodos', 'subTodos')
            .where('todo.user = :userId', { userId })
            .skip(skip)
            .take(limit)
            .orderBy('todo.todoOrder', 'ASC')
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

        const [todos, count] = await this.repository.createQueryBuilder('todo')
            .innerJoinAndSelect('todo.schedule', 'schedule')
            .leftJoinAndSelect('schedule.alarms', 'alarms')
            .leftJoinAndSelect('todo.todoTags', 'todoTags')
            .leftJoinAndSelect('todoTags.tag', 'tag')
            .leftJoinAndSelect('todo.subTodos', 'subTodos')
            .where('todo.user = :userId', { userId })
            .andWhere('todo.completed = 1')
            .skip(skip)
            .take(limit)
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .getManyAndCount();

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
        const todos = await this.repository.createQueryBuilder('todo')
            .innerJoinAndSelect('todo.schedule', 'schedule')
            .leftJoinAndSelect('schedule.alarms', 'alarms')
            .leftJoinAndSelect('todo.todoTags', 'todoTags')
            .leftJoinAndSelect('todoTags.tag', 'tag')
            .leftJoinAndSelect('todo.subTodos', 'subTodos')
            .where('todo.user = :userId', { userId })
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
        const completed = parsedTodos.filter(todo => todo.completed);
        
        return {
            data: {
                todos: unCompleted,
                completedTodos: completed
            }
        }
    }

    /* 검색 */
    async findTodosBySearch(userId: string, content: string): Promise<TodoResponse[]> {
        const [todos, count] = await this.repository.createQueryBuilder('todo')
            .innerJoinAndSelect('todo.schedule', 'schedule')
            .leftJoinAndSelect('schedule.alarms', 'alarms')
            .leftJoinAndSelect('todo.todoTags', 'todoTags')
            .leftJoinAndSelect('todoTags.tag', 'tag')
            .leftJoinAndSelect('todo.subTodos', 'subTodos')
            .where('todo.user = :userId', { userId })
            .andWhere('(LOWER(schedule.content) LIKE LOWER(:searchValue) OR LOWER(tag.content) LIKE LOWER(:searchValue))')
            .andWhere('todo.completed = 0')
            .setParameters({ searchValue: `%${content}%` })
            .orderBy('todo.todoOrder', 'ASC')
            .addOrderBy('subTodos.subTodoOrder', 'ASC')
            .take(50)
            .getManyAndCount();
        
        return todosParseToTodoResponse(todos)
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

    /* todo flag 변경할 때만 사용 */
    async updateTodoFlag(userId: string, todoId: string, flag: boolean) : Promise<void> {
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
                flag
            });
            await this.repository.save(updatedTodo);
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


    /* 투두 완료처리 */
    async updateTodoToComplete(todoId: string, notRepeatTodoCompleteDto: NotRepeatTodoCompleteDto, queryRunner? : QueryRunner): Promise<void> {
        const shouldReleaseQueryRunner = !queryRunner;
        const todoRepository = queryRunner.manager.getRepository(Todo);
        const subtodoRepository = queryRunner.manager.getRepository(Subtodo);

        if (shouldReleaseQueryRunner) {
            queryRunner = queryRunner.manager.connection.createQueryRunner();
            await queryRunner.connect();
        }
        await queryRunner.startTransaction();
        try {
            await Promise.all([
                todoRepository.update({ id: todoId }, notRepeatTodoCompleteDto),
                subtodoRepository.update({ todo: { id: todoId } }, notRepeatTodoCompleteDto),
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

    /* 반복된 투두 완료 처리 */
    async updateRepeatTodoToComplete(userId: string, todoId: string, createTodoDto: CreateTodoDto):Promise<void> {

        const { endDate } = createTodoDto
        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const promises: Promise<any>[] = [queryRunner.manager.update(Todo, { id: todoId }, { completed: true }),
            queryRunner.manager.update(Subtodo, { todo: todoId }, { completed: true })]
            if (endDate) {
                // promises.push(this.createTodo(userId, createTodoDto))
            }
            const [updateTodo, updateSubTodo, createNewTodo] = await Promise.all(promises);
            // Commit transaction
            await queryRunner.commitTransaction();
            return createNewTodo
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