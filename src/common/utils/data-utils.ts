import { BaseAlarm } from "src/alarms/interface/CreateAlarmToScheduleResponse.interface";
import { GetTodoResponse } from "src/todos/interface/todo.interface";

/* 태그별 투두 raw query 데이터 파싱 함수 */
export const formattedTodoDataFromTagRawQuery = (data: any[], tagId: string): GetTodoResponse[] => {
    const result: any[] = [];

    data.forEach((item) => {
        const existingItem = result.find((i) => i.id === item.todo_id);

        if (existingItem) {
            // If the item already exists in the result array, just add the alarm and sub-todo data
            if (item.alarm_id && !existingItem.alarms.some(a => a.id === item.alarm_id)) {
                existingItem.alarms.push({
                    id: item.alarm_id,
                    time: item.alarm_time,
                });
            }

            if (item.subTodo_id && !existingItem.subTodos.some(s => s.id === item.subTodo_id)) {
                existingItem.subTodos.push({
                    id: item.subTodo_id,
                    content: item.subTodo_content,
                    subTodoOrder: item.subTodo_order,
                    completed: item.subTodo_completed ? true : false,
                });
            }

            if (item.tag_id && !existingItem.tags.some(t => t.id === item.tag_id)) {
                existingItem.tags.push({
                    id: item.tag_id,
                    content: item.tag_content,
                });
            }


            if (item.tag_id == tagId) {
                existingItem.todoOrder = item.todo_order
            }
        } else {
            // If the item doesn't exist in the result array, create a new object and add the alarm and sub-todo data
            const newItem : GetTodoResponse = {
                // tag_id: item.tag_id,
                // tag_content: item.tag_content,
                id: item.todo_id,
                content: item.todo_content,
                memo: item.todo_memo,
                todayTodo: item.todo_todayTodo ? true : false,
                flag: item.todo_flag ? true : false,
                repeatOption: item.todo_repeatOption,
                repeatWeek: item.todo_repeatWeek,
                repeatMonth: item.todo_repeatMonth,
                repeatYear: item.todo_repeatYear,
                endDate: item.todo_endDate,
                endDateTime: item.todo_endDateTime,
                repeatEnd : item.todo_repeatEnd,
                completed : item.todo_completed ? true : false,
                createdAt: item.todo_created_At,
                updatedAt: item.todo_updated_At,
                todoOrder: null,
                alarms: [],
                subTodos: [],
                tags: []
            };

            if (item.tag_id == tagId) {
                newItem.todoOrder = item.todo_order
            }

            if (item.alarm_id) {
                newItem.alarms.push({
                    id: item.alarm_id,
                    time: item.alarm_time,
                });
            }

            if (item.subTodo_id) {
                newItem.subTodos.push({
                    id: item.subTodo_id,
                    content: item.subTodo_content,
                    subTodoOrder: item.subTodo_order,
                    completed: item.subTodo_completed ? true : false,
                });
            }

            if (item.tag_id) {
                newItem.tags.push({
                    id: item.tag_id,
                    content: item.tag_content,
                });
            }

            result.push(newItem);
        }
    });

    result.sort((a, b) => a.todoOrder - b.todoOrder)

    return result;
}
