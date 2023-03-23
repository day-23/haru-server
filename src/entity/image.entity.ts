import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany, Column } from 'typeorm';
import { Comment } from './comment.entity';
import { PostLike } from './post-like.entity';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity()
export class Image extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    originalName: string;

    @Column()
    mimeType: string;

    @Column("decimal", { precision: 10, scale: 2 })
    size: number;

    @Column()
    url: string;

    /* 다른 엔터티들간의 관계 */
    /* 사진 : 게시글 = N:1 */
    @ManyToOne(() => Post, (post) => post.postImages)
    @JoinColumn({ name: 'post_id' })
    post: Post;

    /* 프로필 사진 : 사용자 */
    @ManyToOne(() => User, (user) => user.profileImages)
    @JoinColumn({ name: 'user_id' })
    user: User;

    /* 사진 : 댓글 = 1:N */
    @OneToMany(() => Comment, (comment) => comment.id)
    comment: Comment[];

    /* 사진 : 좋아요 = 1:N */
    @OneToMany(() => PostLike, (postlike) => postlike.id)
    postlike: PostLike[];

}