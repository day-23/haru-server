import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany, Column } from 'typeorm';
import { Comment } from './comment.entity';
import { PostImage } from './post-image.entity';
import { PostLike } from './post-like.entity';
import { TagWithPost } from './tag-with-post.entity';
import { User } from './user.entity';

@Entity()
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    content: string

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn()
    deletedAt?: Date | null;

    /* 다른 엔터티들간의 관계 */
    /* 게시글 : 사용자 = N:1 */
    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user: User;

    /* 게시글 : 사진 = 1:N */
    @OneToMany(() => PostImage, (postImage) => postImage.post)
    postImages: PostImage[];

    /* 게시글 : 댓글 = 1:N */
    @OneToMany(() => Comment, (comment) => comment.id)
    comment: Comment[]

    /* 게시물 : 태그게시물 = 1:N */
    @OneToMany(() => TagWithPost, (tagwithpost) => tagwithpost.id)
    tagWithTodo: TagWithPost[];

    /* 게시물 : 좋아요 = 1:N */
    @OneToMany(() => PostLike, (postlike) => postlike.id)
    postlike: PostLike[]

}