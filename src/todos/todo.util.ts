import { Subtodo } from "src/entity/subtodo.entity";
import { Todo } from "src/entity/todo.entity";
import { ScheduleResponse } from "src/schedules/interface/schedule.interface";
import { BaseTag, BaseTagForTodoResponse } from "src/tags/interface/tag.interface";
import { CreateTodoDto } from "./dto/create.todo.dto";
import { BaseSubTodo, TodoResponse } from "./interface/todo.return.interface";

export function parseTodoResponse(scheduleResponse: ScheduleResponse, todo: Todo, savedTags: BaseTag[], savedSubTodos: Subtodo[]): TodoResponse {
    //savedTags parse to BaseTagForTodoResponse
    const tags: BaseTagForTodoResponse[] = savedTags.map(({ id, content }) => ({ id, content }))

    //savedSubTodos parse to BaseSubTodo
    const subTodos: BaseSubTodo[] = savedSubTodos.map(({ id, content, subTodoOrder, completed }) => ({ id, content, subTodoOrder, completed }))

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
        folded: todo.folded,
        subTodos,
        tags,
        alarms: scheduleResponse.alarms,
        createdAt: scheduleResponse.createdAt,
        updatedAt: scheduleResponse.updatedAt,
    };

    return response;
}


export function todosParseToTodoResponse(todos: Todo[]): TodoResponse[] {
    const parentTodos = []
    const childTodos = []

    todos.forEach(todo => {
        if (todo.schedule.parent) {
            childTodos.push(todo)
        } else {
            parentTodos.push(todo)
        }
    })

    // make dictionary by childTodos that key is parentTodo's id and value is max repeatEnd
    const childTodosDictionary = childTodos.reduce((acc, cur) => {
        const parentTodoId = cur.schedule.parent.id
        if (acc[parentTodoId]) {
            if (acc[parentTodoId] < cur.schedule.repeatEnd) {
                acc[parentTodoId] = cur.schedule.repeatEnd
            }
        } else {
            acc[parentTodoId] = cur.schedule.repeatEnd
        }
        return acc
    }, {})

    const todoResponses: TodoResponse[] = parentTodos.map(todo => {
        const scheduleResponse: ScheduleResponse = {
            id: todo.schedule.id,
            content: todo.schedule.content,
            memo: todo.schedule.memo,
            isAllDay: todo.schedule.isAllDay,
            repeatOption: todo.schedule.repeatOption,
            repeatValue: todo.schedule.repeatValue,
            repeatEnd: childTodosDictionary[todo.schedule.id] || todo.schedule.repeatEnd,
            repeatStart: todo.schedule.repeatStart,
            alarms: todo.schedule.alarms,
            createdAt: todo.schedule.createdAt,
            updatedAt: todo.schedule.updatedAt,
            category: null
        }
        return parseTodoResponse(scheduleResponse, todo, todo.todoTags.map(todoTag => todoTag.tag), todo.subTodos)
    })
    return todoResponses;
}

export function existingTodoToCreateTodoDto(existingTodo: Todo): CreateTodoDto {
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
        alarms: schedule.alarms.map(alarm => alarm.time),
        parent: schedule.parent ? schedule.parent.id : null
    }
    return createTodoDto
}

export function existingTodoToUnRepeatCreateTodoDto(existingTodo: Todo): CreateTodoDto {
    const newTodo = existingTodoToCreateTodoDto(existingTodo)
    newTodo.repeatEnd = null
    newTodo.repeatOption = null
    newTodo.repeatValue = null
    return newTodo
}