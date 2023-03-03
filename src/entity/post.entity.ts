import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Comment } from './comment.entity';
import { PostImage } from './post-image.entity';
import { User } from './user.entity';

@Entity()
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn({ name: 'create_at', comment: '생성일' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'update_at', comment: '수정일' })
    updatedAt: Date;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn({ name: 'delete_at', comment: '삭제일' })
    deletedAt?: Date | null;

    /* 다른 엔터티들간의 관계 */
    /* 게시글 : 사용자 = N:1 */
    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user: User;

    /* 게시글 : 사진 = 1:N */
    @OneToMany(() => PostImage, (postImage) => postImage.id)
    postImage: PostImage[];

    /* 게시글 : 댓글 = 1:N */
    @OneToMany(() => Comment, (comment) => comment.id)
    comment: Comment[]
}