import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany, Column } from 'typeorm';
import { Schedule } from './schedule.entity';
import { Todo } from './todo.entity';

/* 일정이나 투두에 대한 개별 알람 */
@Entity({ name: 'alarm' })
export class Alarm extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /* 알람 시간 */
    @CreateDateColumn({ name: 'time', comment: '알림시간' })
    time: Date;

    @CreateDateColumn({ name: 'create_at', comment: '생성일' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'update_at', comment: '수정일' })
    updatedAt: Date;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn({ name: 'delete_at', comment: '삭제일' })
    deletedAt?: Date | null;

    /* 알람 : 투두 = N : 1*/
    @ManyToOne(()=> Todo, (todo)=>todo.id)
    @JoinColumn({name : 'todo_id'})
    todo : Todo

    /* 알람 : 스케줄 = N : 1*/
    @ManyToOne(()=> Schedule, (schedule)=>schedule.id)
    @JoinColumn({name : 'schedule_id'})
    schedule : Schedule
}