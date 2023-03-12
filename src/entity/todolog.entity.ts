import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SubTodo } from './sub-todo.entity';
import { Todo } from './todo.entity';
import { User } from './user.entity';

@Entity()
export class TodoLog extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn()
    deletedAt?: Date | null;


    /* 다른 엔터티들간의 관계 */
    @ManyToOne(()=> User, (user)=>user.todoLogs)
    @JoinColumn({name : 'user_id'})
    user : User;


    /* 투두로그 : 투두 = N : 1 */
    @ManyToOne(() => Todo, (todo) => todo.todoLog)
    @JoinColumn({ name: 'todo_id' })
    todo: Todo;

    /* 투두로그 : 서브투두 = N : 1 */
    @ManyToOne(() => SubTodo, (subTodo) => subTodo.todoLog)
    @JoinColumn({ name: 'sub_todo_id' })
    subTodo: SubTodo;


}