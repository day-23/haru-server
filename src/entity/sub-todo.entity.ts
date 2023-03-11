import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Column, OneToMany } from 'typeorm';
import { Todo } from './todo.entity';
import { TodoLog } from './todolog.entity';

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

    @CreateDateColumn({ name: 'create_at', comment: '생성일' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'update_at', comment: '수정일' })
    updatedAt: Date;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn({ name: 'delete_at', comment: '삭제일' })
    deletedAt?: Date | null;

    /* 다른 엔터티들간의 관계 */
    @ManyToOne(() => Todo, (todo) => todo.subTodos, { onDelete:'CASCADE' })
    @JoinColumn({ name: 'todo_id' })
    todo: Todo | string;

    /* 투두 : 투두로그 = 1:N */
    @OneToMany(() => TodoLog, (todolog) => todolog.todo)
    todoLog: TodoLog[];
}