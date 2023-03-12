import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Follow extends BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn()
    deletedAt?: Date | null;


    /* 다른 엔터티들간의 관계 */
    /* 사용자 : 팔로우 = N:1 */
    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user: User;
}