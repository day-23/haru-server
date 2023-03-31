import { Schedule } from "src/entity/schedule.entity";
import { Subtodo } from "src/entity/subtodo.entity";
import { Tag } from "src/entity/tag.entity";
import { Todo } from "src/entity/todo.entity";
import { ScheduleResponse } from "src/schedules/interface/schedule.interface";
import { BaseTag, BaseTagForTodoResponse } from "src/tags/interface/tag.interface";
import { CreateTodoDto } from "./dto/create.todo.dto";
import { BaseSubTodo, TodoResponse } from "./interface/todo.interface";

export function parseTodoResponse(scheduleResponse: ScheduleResponse, todo: Todo, savedTags:BaseTag[], savedSubTodos: Subtodo[]): TodoResponse {
    //savedTags parse to BaseTagForTodoResponse
    const tags: BaseTagForTodoResponse[] = savedTags.map(({id, content}) => ({id, content}))

    //savedSubTodos parse to BaseSubTodo
    const subTodos: BaseSubTodo[] = savedSubTodos.map(({id, content, subTodoOrder, completed}) => ({id, content, subTodoOrder, completed}))

    const response: TodoResponse = {
        id: todo.id,
        content: scheduleResponse.content,
        memo: scheduleResponse.memo,
        todayTodo: todo.todayTodo,
        flag: todo.flag,
        isAllDay: scheduleResponse.isAllDay,
        endDate: scheduleResponse.repeatStart,
        repeatOption: scheduleResponse.repeatOption,
        repeatValue: scheduleResponse.repeatValue,
        repeatEnd: scheduleResponse.repeatEnd,
        todoOrder: todo.todoOrder,
        completed: todo.completed,
        folded : todo.folded,
        subTodos,
        tags,
        alarms: scheduleResponse.alarms,
        createdAt: scheduleResponse.createdAt,
        updatedAt: scheduleResponse.updatedAt,
    };
    
    return response;
}


export function todosParseToTodoResponse(todos : Todo[]) : TodoResponse[] {
    const todoResponses : TodoResponse[] = todos.map(todo => {
        const scheduleResponse : ScheduleResponse = {
            id: todo.schedule.id,
            content: todo.schedule.content,
            memo: todo.schedule.memo,
            isAllDay: todo.schedule.isAllDay,
            repeatOption: todo.schedule.repeatOption,
            repeatValue: todo.schedule.repeatValue,
            repeatEnd: todo.schedule.repeatEnd,
            repeatStart: todo.schedule.repeatStart,
            alarms: todo.schedule.alarms,
            createdAt: todo.schedule.createdAt,
            updatedAt: todo.schedule.updatedAt,
            category : null
        }
        return parseTodoResponse(scheduleResponse, todo, todo.todoTags.map(todoTag => todoTag.tag), todo.subTodos)
    })
    return todoResponses;
}

export function existingTodoToCreateTodoDto(existingTodo : Todo) : CreateTodoDto{
    const { id, user, schedule, ...todoData } = existingTodo
    const createTodoDto: CreateTodoDto = {
        ...todoData,
        content: schedule.content,
        memo: schedule.memo,
        isAllDay: schedule.isAllDay,
        repeatOption: schedule.repeatOption,
        repeatValue: schedule.repeatValue,
        endDate: schedule.repeatStart,
        repeatEnd: schedule.repeatEnd,
        subTodos: todoData.subTodos.map(subTodo => subTodo.content),
        tags: todoData.todoTags.map(todoTag => todoTag.tag.content),
        alarms: []
    }
    return createTodoDto
}