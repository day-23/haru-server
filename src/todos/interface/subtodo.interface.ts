export interface BaseSubTodo {
    id: string,
    content: string,
    subTodoOrder: number,
}

export interface GetSubTodoResponse extends BaseSubTodo {
    completed : boolean
}