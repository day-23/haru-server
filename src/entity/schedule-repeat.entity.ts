import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany, Column, OneToOne } from 'typeorm';
import { Schedule } from './schedule.entity';
import { Todo } from './todo.entity';
import { User } from './user.entity';

/* 투두 반복설정 데이터 */
@Entity()
export class ScheduleRepeat extends BaseEntity {
    constructor(data?: Partial<ScheduleRepeat>) {
        super();
        if (data) {
            Object.assign(this, data);
        }
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    repeatOption: string;

    @Column({ length: 31})
    repeatValue: string;

    /* 스케줄 반복 : 스케줄 = 1 : 1*/
    @OneToOne(() => Schedule, (schedule) => schedule.scheduleRepeat, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'schedule_id' })
    schedule: Schedule
}