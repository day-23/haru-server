import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Image } from './image.entity';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity()
export class Liked extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /* 댓글 : 사용자 = N : 1 */
    @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    /* 다른 엔터티들간의 관계 */
    /* 댓글 : 게시글 = N : 1 */
    @ManyToOne(() => Post, (post) => post.liked, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'post_id' })
    post: Post;

    /* 친구 승낙, 차단 여부 */
    // 0 -> 신고
    // 1 -> 숨기기
    // 2 -> 좋아요
    @Column({ default: 2 })
    status: number

    @CreateDateColumn()
    createdAt: Date;
}