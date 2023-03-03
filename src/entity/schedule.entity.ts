import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, JoinColumn, ManyToOne, Column } from 'typeorm';
import { Category } from './schedule-category.entity';
import { User } from './user.entity';

@Entity()
export class Schedule extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    content: string;

    @Column({
        length : 500
    })
    memo: string;

    @Column()
    repeatOption: string;

    @Column()
    repeat: string;

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

}