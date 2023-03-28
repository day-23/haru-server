import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Alarm } from "src/entity/alarm.entity";
import { Subtodo } from "src/entity/subtodo.entity";
import { TodoTags } from "src/entity/todo-tags.entity";
import { Tag } from "src/entity/tag.entity";
import { Todo } from "src/entity/todo.entity";
import { User } from "src/entity/user.entity";

export class BaseTodoDto {
    @ApiProperty({ description: '오늘 할일인지 체크' })
    @IsBoolean()
    todayTodo: boolean;

    @ApiProperty({ description: '중요한 할일인지 체크' })
    @IsBoolean()
    flag: boolean;
}

export class CreateBaseTodoDto extends BaseTodoDto {
}

export class CreateTodoDto extends BaseTodoDto {
    @ApiProperty({ description: 'todo 내용' })
    @MinLength(1)
    @MaxLength(200)
    @IsString()
    content: string;

    @ApiProperty({ description: 'todo에 작성하는 메모' })
    @MaxLength(500)
    @IsString()
    memo: string;

    @ApiProperty({ description: '할일을 하루종일 하는건지 여부' })
    @IsBoolean()
    isAllDay: boolean;

    /* 반복 설정 관련 */
    @ApiProperty({ description: 'todo 반복 주기 : 일, 주, 월, 년 등, 정해야함', nullable: true })
    @MaxLength(10)
    @IsOptional() /* nullable */
    repeatOption: string;

    @ApiProperty({ description: 'todo 반복 방식, repeatOption에 따라 다른 값', nullable: true })
    @MaxLength(31)
    @IsOptional() /* nullable */
    repeatValue: string;

    @ApiProperty({ description: '마감날짜', nullable: true })
    @IsOptional() /* nullable */
    @Transform(({ value }) => value ? new Date(value) : null)
    endDate: Date;

    @ApiProperty({ description: '반복 끝', nullable: true })
    @IsOptional()
    @Transform(({ value }) => value ? new Date(value) : null)
    repeatEnd: Date;

    @ApiProperty({ description: 'tag의 이름들' })
    @IsString({ each: true })
    tags: string[];

    @ApiProperty({ description: 'subTodos의 내용들' })
    @IsString({ each: true })
    subTodos: string[];

    @ApiProperty({ description: 'alarms 시간들' })
    @IsString({ each: true })
    alarms: Date[];
}

export class UpdateTodoDto extends PartialType(CreateTodoDto) { }


export function updateTodoFromDto(existingTodo: Todo, todoDto: CreateTodoDto, userId: string, tags: Tag[]): Todo {
    const existingTagIds = []
    const existingTagIdsAndTodoOrderDic = {}

    // existingTodo.tagWithTodos.map((tagWithTodo) => {
    //     const tagId = tagWithTodo.tag.id
    //     existingTagIds.push(tagId)
    //     existingTagIdsAndTodoOrderDic[tagId] = tagWithTodo.todoOrder
    // })

    const user = new User({ id: userId })
    const todo = new Todo();
    todo.id = existingTodo.id;
    // todo.content = todoDto.content;
    // todo.memo = todoDto.memo;
    // todo.todayTodo = todoDto.todayTodo;
    // todo.flag = todoDto.flag;
    // todo.isSelectedEndDateTime = todoDto.isSelectedEndDateTime;
    // todo.endDate = todoDto.endDate;
    // todo.repeatEnd = todoDto.repeatEnd;
    todo.subTodos = todoDto.subTodos.map((content, subTodoOrder) => new Subtodo({ content, subTodoOrder, completed: existingTodo.subTodos[subTodoOrder].completed }));
    // todo.alarms = todoDto.alarms.map(time => new Alarm({ user, time }));
    // todo.tagWithTodos = tags.map(tag => {
    //     if (existingTagIds.includes(tag.id)) {
    //         return new TodoTags({ user, todo, tag, todoOrder: existingTagIdsAndTodoOrderDic[tag.id] })
    //     } else {
    //         // return new TodoTags({ user, todo, tag, todoOrder: tag.nextTagWithTodoOrder })
    //     }
    // })
    // todo.repeat = new Repetition({ todo, repeatOption: todoDto.repeatOption, repeatValue: todoDto.repeatValue })
    // todo.user = user;
    todo.todoOrder = existingTodo.todoOrder
    todo.todayTodoOrder = existingTodo.todayTodoOrder
    return todo;
}


