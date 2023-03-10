import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, JoinColumn, ManyToOne, Column, OneToMany } from 'typeorm';
import { Alarm } from './alarm.entity';
import { Category } from './schedule-category.entity';
import { User } from './user.entity';

@Entity()
export class Schedule extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    content: string;

    @Column({
        length : 500,
        nullable : true
    })
    memo: string;

    @Column({ nullable: true })
    repeatOption: string;

    @Column({ length: 7, nullable: true, })
    repeat: string;

    @Column({ type: 'timestamp', nullable: true })
    repeatEnd: Date;

    @Column({comment: '마감일', nullable:true })
    endDate: Date;

    @Column({comment: '마감일, 마감 시간', nullable:true })
    endDateTime: Date;

    @CreateDateColumn({ name: 'create_at', comment: '생성일' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'update_at', comment: '수정일' })
    updatedAt: Date;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn({ name: 'delete_at', comment: '삭제일' })
    deletedAt?: Date | null;


    /* 다른 엔터티들간의 관계 */
    /* 스케줄 : 사용자 = N : 1 */
    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user: User;

    /* 스케줄 : 카테고리 = N:1 */
    @ManyToOne(() => Category, (category) => category.id)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    /* 스케줄 : 알람 = 1:N */
    @OneToMany(()=> Alarm, (alarm)=>alarm.id)
    alarm : Alarm[];

}