import { Todo } from "src/entity/todo.entity";
import { TodoResponse } from "./interface/todo.interface";

export function savedTodoJsonToTodoResponse(savedTodo: Todo): TodoResponse {
    return {
        id: savedTodo.id,
        content: savedTodo.content,
        memo: savedTodo.memo,
        todayTodo: savedTodo.todayTodo,
        flag: savedTodo.flag,
        isSelectedEndDateTime: savedTodo.isSelectedEndDateTime,
        endDate: savedTodo.endDate,
        repeatOption: savedTodo.todoRepeat.repeatOption,
        repeatValue: savedTodo.todoRepeat.repeatValue,
        repeatEnd: savedTodo.repeatEnd,
        todoOrder: savedTodo.todoOrder,
        completed: savedTodo.completed,
        createdAt: savedTodo.createdAt,
        updatedAt: savedTodo.updatedAt,
        subTodos: savedTodo.subTodos.map(({ id, content, subTodoOrder, completed }) => ({ id, content, subTodoOrder, completed })),
        alarms: savedTodo.alarms.map(({ id, time }) => ({ id, time })),
        tags: savedTodo.tagWithTodos.map(({ tag }) => ({ id: tag.id, content: tag.content }))
    }
}