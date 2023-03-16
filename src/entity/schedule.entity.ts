import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, JoinColumn, ManyToOne, Column, OneToMany } from 'typeorm';
import { Alarm } from './alarm.entity';
import { Category } from './category.entity';
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

    @Column({ nullable: true })
    repeatOption: string;

    @Column()
    timeOption : boolean;

    @Column({ length: 7, nullable: true, })
    repeatWeek: string;

    @Column({ length: 31, nullable: true, })
    repeatMonth: string;

    @Column({ type: 'timestamp', nullable: true })
    repeatStart: Date;

    @Column({ type: 'timestamp', nullable: true })
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
    @ManyToOne(() => Category, (category) => category.schedules)
    @JoinColumn({ name: 'category_id' })
    category: Category | string;

    /* 스케줄 : 알람 = 1:N */
    @OneToMany(() => Alarm, (alarm) => alarm.schedule)
    alarms: Alarm[] | string[];
}