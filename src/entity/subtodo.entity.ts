import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Column, OneToMany } from 'typeorm';
import { Todo } from './todo.entity';
import { User } from './user.entity';

@Entity()
export class Subtodo extends BaseEntity {
    constructor(data?: Partial<Subtodo>) {
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
    subTodoOrder: number;

    @Column({default : false})
    completed: boolean;

    /* 다른 엔터티들간의 관계 */
    @ManyToOne(() => Todo, (todo) => todo.subTodos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'todo_id' })
    todo: Todo;
}