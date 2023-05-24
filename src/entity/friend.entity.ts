import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Friend extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /* 다른 엔터티들간의 관계 */
    /* 사용자 : 팔로우 = N:1 */
    @ManyToOne(() => User, (user) => user.requesters, { onDelete: 'CASCADE' })
    @JoinColumn()
    requester: User;

    @ManyToOne(() => User, (user) => user.acceptors, { onDelete: 'CASCADE' })
    @JoinColumn()
    acceptor: User;

    /* 친구 승낙, 차단 여부 */
    // 0 -> 신청중
    // 1 -> 친구
    // 2 -> 차단
    @Column({ default: 0 })
    status: number

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}