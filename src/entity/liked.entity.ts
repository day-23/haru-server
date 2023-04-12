import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Image } from './image.entity';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity()
export class Liked extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /* 댓글 : 사용자 = N : 1 */
    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user: User;

    /* 다른 엔터티들간의 관계 */
    /* 댓글 : 게시글 = N : 1 */
    @ManyToOne(() => Post, (post) => post.id, {onDelete: 'CASCADE'})
    @JoinColumn({ name: 'post_id' })
    post: Post;

    @CreateDateColumn()
    createdAt: Date;
}