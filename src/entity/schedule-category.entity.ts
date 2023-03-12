import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, OneToMany, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Schedule } from './schedule.entity';
import { User } from './user.entity';

@Entity()
export class Category extends BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    content: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn()
    deletedAt?: Date | null;

    /* 다른 엔터티들간의 관계 */
    /* 카테고리 : 사용자 = N : 1 */
    @ManyToOne(()=>User, (user)=>user.id)
    @JoinColumn({name: 'user_id'})
    user: User;

    /* 카테고리 : 스케줄 = 1:N */
    @OneToMany(()=> Schedule, (schedule) => schedule.id)
    scheduleId: Schedule[];

}