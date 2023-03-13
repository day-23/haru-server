import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany, Column } from 'typeorm';
import { Schedule } from './schedule.entity';
import { Todo } from './todo.entity';
import { User } from './user.entity';

/* 일정이나 투두에 대한 개별 알람 */
@Entity({ name: 'alarm' })
export class Alarm extends BaseEntity {
    constructor(data?: Partial<Alarm>) {
        super();
        if (data) {
            Object.assign(this, data);
        }
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    /* 알람 시간 */
    @CreateDateColumn()
    time: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn()
    deletedAt?: Date | null;

    /* 알람 : 사용자 = N : 1*/
    @ManyToOne(()=> User, (user)=>user.alarms)
    @JoinColumn({name : 'user_id'})
    user : User | string

    /* 알람 : 투두 = N : 1*/
    @ManyToOne(()=> Todo, (todo)=>todo.alarms, {onDelete: 'CASCADE'})
    @JoinColumn({name : 'todo_id'})
    todo : Todo | string

    /* 알람 : 스케줄 = N : 1*/
    @ManyToOne(()=> Schedule, (schedule)=>schedule.alarms, {onDelete: 'CASCADE'})
    @JoinColumn({name : 'schedule_id'})
    schedule : Schedule | string
}