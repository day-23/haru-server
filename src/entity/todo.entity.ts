import { MinLength } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany, Column, OneToOne, Relation } from 'typeorm';
import { Alarm } from './alarm.entity';
import { SubTodo } from './sub-todo.entity';
import { TagWithTodo } from './tag-with-todo.entity';
import { TodoRepeat } from './todo-repeat.entity';
import { User } from './user.entity';

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

    @Column()
    @MinLength(1)
    content: string;

    @Column({
        nullable: true,
        length: 500
    })
    memo: string;

    /* 오늘 할일 */
    @Column()
    todayTodo: boolean;

    /* 중요한 */
    @Column()
    flag: boolean;

    @Column({ comment: '마감 시간, 선택 여부' })
    isSelectedEndDateTime: boolean;

    @Column({ comment: '마감일', nullable: true })
    endDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    repeatEnd: Date;

    @Column({ default: 0 }) // 전체에서의 순서
    todoOrder: number;

    @Column({ default: 0 }) // 전체에서의 순서
    todayTodoOrder: number;

    @Column({ default: -1 })
    nextSubTodoOrder: number;

    @Column({ default: false })
    completed: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ select: false })
    updatedAt: Date;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn()
    deletedAt?: Date | null;

    /* 다른 엔터티들간의 관계 */
    /* 투두 : 사용자 = N:1 */
    @ManyToOne(() => User, (user) => user.todos)
    @JoinColumn({ name: 'user_id' })
    user: User;

    /* 투두 : 태그투두 = 1:N */
    @OneToMany(() => TagWithTodo, (tagwithtodo) => tagwithtodo.todo, { cascade: true })
    tagWithTodos: TagWithTodo[];

    /* 투두 : 하위항목 = 1:N */
    @OneToMany(() => SubTodo, (subtodo) => subtodo.todo, { cascade: true })
    subTodos: SubTodo[];

    /* 투두 : 알람 = 1:N */
    @OneToMany(() => Alarm, (alarm) => alarm.todo, { cascade: true })
    alarms: Alarm[];

    @OneToOne('TodoRepeat', 'todo', { cascade: true })
    todoRepeat: Relation<TodoRepeat>
}