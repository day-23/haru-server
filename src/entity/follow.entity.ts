import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Follow extends BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    relation : boolean

    /* 다른 엔터티들간의 관계 */
    /* 사용자 : 팔로우 = N:1 */
    @ManyToOne(() => User, (user) => user.follow)
    @JoinColumn()
    follow: User;

    @ManyToOne(() => User, (user) => user.following)
    @JoinColumn()
    following: User;

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
}