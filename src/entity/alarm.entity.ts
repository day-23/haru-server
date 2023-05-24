import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Schedule } from './schedule.entity';
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

    /* 알람 : 사용자 = N : 1*/
    @ManyToOne(() => User, (user) => user.alarms, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User

    /* 알람 : 투두 = N : 1*/
    @ManyToOne(() => Schedule, (schedule) => schedule.alarms, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'schedule_id' })
    schedule: Schedule

    /* 알람 시간 */
    @CreateDateColumn()
    time: Date;
}