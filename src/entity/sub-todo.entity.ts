import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Column, OneToMany } from 'typeorm';
import { Todo } from './todo.entity';
import { TodoLog } from './todolog.entity';
import { User } from './user.entity';

@Entity()
export class SubTodo extends BaseEntity {
    constructor(data?: Partial<SubTodo>) {
        super();
        if (data) {
            Object.assign(this, data);
        }
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    content: string;

    @Column({ default: 0 })
    order: number;

    @Column()
    completed: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn()
    deletedAt?: Date | null;

    /* 다른 엔터티들간의 관계 */
    @ManyToOne(() => User, (user) => user.subTodos)
    @JoinColumn({ name: 'user_id' })
    user: User | string;


    @ManyToOne(() => Todo, (todo) => todo.subTodos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'todo_id' })
    todo: Todo | string;

    /* 투두 : 투두로그 = 1:N */
    @OneToMany(() => TodoLog, (todolog) => todolog.todo)
    todoLog: TodoLog[];
}