import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, JoinColumn, ManyToOne, Column, OneToMany } from 'typeorm';
import { Alarm } from './alarm.entity';
import { Category } from './category.entity';
import { ScheduleRepeat } from './schedule-repeat.entity';
import { User } from './user.entity';

@Entity()
export class Schedule extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    content: string;

    @Column({
        length: 500,
        nullable: true
    })
    memo: string;

    /* 중요한 */
    @Column()
    flag: boolean;

    @Column()
    timeOption : boolean;

    @Column({ type: 'timestamp' })
    repeatStart: Date;

    @Column({ type: 'timestamp' })
    repeatEnd: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn()
    deletedAt?: Date | null;

    /* 다른 엔터티들간의 관계 */
    /* 스케줄 : 사용자 = N : 1 */
    @ManyToOne(() => User, (user) => user.schedules)
    @JoinColumn({ name: 'user_id' })
    user: User | string;

    /* 스케줄 : 카테고리 = N:1 */
    @ManyToOne(() => Category, (category) => category.schedules, {onDelete : "SET NULL"})
    @JoinColumn({ name: 'category_id' })
    category: Category | string;

    /* 스케줄 : 알람 = 1:N */
    @OneToMany(() => Alarm, (alarm) => alarm.schedule)
    alarms: (Alarm | string)[];

    /* 스케줄 : 스케줄 반복 = 1:1 */
    @OneToOne(()=> ScheduleRepeat, (schedulerepeat) => schedulerepeat.schedule)
    scheduleRepeat : ScheduleRepeat
}