import { Subtodo } from "src/entity/subtodo.entity";
import { Tag } from "src/entity/tag.entity";
import { Todo } from "src/entity/todo.entity";
import { ScheduleResponse } from "src/schedules/interface/schedule.interface";
import { BaseTag, BaseTagForTodoResponse } from "src/tags/interface/tag.interface";
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
        isAllDay: scheduleResponse.isAllDay,
        endDate: scheduleResponse.repeatStart,
        repeatEnd: scheduleResponse.repeatEnd,
        repeatOption: scheduleResponse.repeatOption,
        repeatValue: scheduleResponse.repeatValue,
        alarms: scheduleResponse.alarms,
        createdAt: scheduleResponse.createdAt,
        updatedAt: scheduleResponse.updatedAt,

        todayTodo: todo.todayTodo,
        flag: todo.flag,
        todoOrder: todo.todoOrder,
        completed: todo.completed,
        folded : todo.folded,
        subTodos,
        tags
    };
    return response;
}
