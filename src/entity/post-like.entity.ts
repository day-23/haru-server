import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PostImage } from './post-image.entity';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity()
export class PostLike extends BaseEntity {
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
    /* 댓글 : 게시글 = N : 1 */
    @ManyToOne(() => Post, (post) => post.id)
    @JoinColumn({ name: 'post_id' })
    post: Post;

    /* 댓글 : 사진 = N : 1 */
    @ManyToOne(() => PostImage, (postImage) => postImage.id)
    @JoinColumn({ name: 'post_image_id' })
    postImage: PostImage;

    /* 댓글 : 사용자 = N : 1 */
    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user: User;
}