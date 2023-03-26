import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany, Column, OneToOne, Relation, Index } from 'typeorm';
import { Subtodo } from './subtodo.entity';
import { TodoTags } from './todo-tags.entity';
import { Schedule } from './schedule.entity';

@Entity({ name: 'todo' })
export class Todo extends BaseEntity {
    constructor(data?: Partial<Todo>) {
        super();
        if (data) {
            Object.assign(this, data);
        }
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    /* 오늘 할일 */
    @Column()
    todayTodo: boolean;

    /* 중요한 */
    @Column()
    flag: boolean;

    @Column({ default: 0 }) // 전체에서의 순서
    todoOrder: number;

    @Column({ default: 0 }) // 전체에서의 순서
    todayTodoOrder: number;

    @Column({ default: false })
    completed: boolean;

    @Column({ default: false })
    folded: boolean;

    /* 다른 엔터티들간의 관계 */

    /* 투두 : 태그투두 = 1:N */
    @OneToMany(() => TodoTags, (tagwithtodo) => tagwithtodo.todo, { cascade: true })
    todoTags: TodoTags[];

    /* 투두 : 하위항목 = 1:N */
    @OneToMany(() => Subtodo, (subtodo) => subtodo.todo, { cascade: true })
    subTodos: Subtodo[];

    @OneToOne(() => Schedule, (schedule) => schedule.todo, { cascade: true })
    @JoinColumn({ name: 'schedule_id' })
    @Index({ unique: true })
    schedule: Schedule
}