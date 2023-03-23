import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Image } from './image.entity';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity()
export class Comment extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    content: string;

    @Column()
    x: number;

    @Column()
    y: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn()
    deletedAt?: Date | null;


    /* 다른 엔터티들간의 관계 */
    /* 댓글 : 게시글 = N : 1 */
    @ManyToOne(() => Post, (post) => post.id)
    @JoinColumn({ name: 'post_id' })
    post: Post;

    /* 댓글 : 사진 = N : 1 */
    @ManyToOne(() => Image, (postImage) => postImage.id)
    @JoinColumn({ name: 'post_image_id' })
    postImage: Image;

    /* 댓글 : 사용자 = N : 1 */
    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user: User;
}