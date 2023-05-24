import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, OneToMany, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Schedule } from './schedule.entity';
import { User } from './user.entity';

@Entity()
export class Category extends BaseEntity {
    constructor(data?: Partial<Category>) {
        super();
        if (data) {
            Object.assign(this, data);
        }
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    /* 다른 엔터티들간의 관계 */
    /* 카테고리 : 사용자 = N : 1 */
    @ManyToOne(() => User, (user) => user.categories, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    /* 카테고리 : 스케줄 = 1:N */
    @OneToMany(() => Schedule, (schedule) => schedule.category)
    schedules: Schedule[];

    @Column()
    content: string;

    @Column({ nullable: true })
    color: string;

    @Column({ default:0 })
    categoryOrder: number;

    @Column({ default : true})
    isSelected : boolean
}