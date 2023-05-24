import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Image } from './image.entity';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity()
export class Comment extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /* 다른 엔터티들간의 관계 */
    /* 댓글 : 게시글 = N : 1 */
    @ManyToOne(() => Post, (post) => post.id, {onDelete: 'CASCADE'})
    @JoinColumn({ name: 'post_id' })
    post: Post;

    /* 댓글 : 사진 = N : 1 */
    @ManyToOne(() => Image, (postImage) => postImage.comments, {onDelete: 'CASCADE'})
    @JoinColumn({ name: 'post_image_id' })
    postImage: Image;

    /* 댓글 : 사용자 = N : 1 */
    @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    content: string;

    @Column({ nullable: true })
    x: number;

    @Column({ nullable: true })
    y: number;

    @Column({ default: true })
    isPublic: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
        
    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn()
    deletedAt?: Date | null;
}