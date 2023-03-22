import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany, Column, OneToOne, Relation } from 'typeorm';
import { Schedule } from './schedule.entity';
import { Todo } from './todo.entity';
import { User } from './user.entity';

/* 투두 반복설정 데이터 */
@Entity()
export class TodoRepeat extends BaseEntity {
    constructor(data?: Partial<TodoRepeat>) {
        super();
        if (data) {
            Object.assign(this, data);
        }
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    repeatOption: string;

    @Column()
    repeatValue: string;

    /* 투두반복 : 투두 = 1 : 1*/
    @OneToOne('Todo', 'todoRepeat', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'todo_id' })
    todo: Relation<Todo>
}