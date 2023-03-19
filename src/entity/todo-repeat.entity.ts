import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany, Column, OneToOne } from 'typeorm';
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

    // @CreateDateColumn()
    // createdAt: Date;

    // @UpdateDateColumn()
    // updatedAt: Date;

    // /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    // @DeleteDateColumn()
    // deletedAt?: Date | null;

    /* 투두반복 : 투두 = 1 : 1*/
    @OneToOne(()=> Todo, (todo)=>todo.alarms, {onDelete: 'CASCADE'})
    @JoinColumn({name : 'todo_id'})
    todo : Todo | string
}