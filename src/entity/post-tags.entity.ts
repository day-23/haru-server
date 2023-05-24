import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';
import { Hashtag } from './hashtag.entity';

@Entity()
export class PostTags extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /* 다른 엔터티들간의 관계 */
    /* tagwithtodo : user = N : 1 */
    @ManyToOne(() => User, (user) => user.postTags, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    /* postTags : tag = N : 1 */
    @ManyToOne(() => Hashtag, (tag) => tag.postTags, { onDelete:'CASCADE' })
    @JoinColumn({ name: 'hashtag_id' })
    hashtag: Hashtag;

    /* tagwithpost : 게시글 = N : 1 */
    @ManyToOne(() => Post, (post) => post.postTags, {onDelete: 'CASCADE'})
    @JoinColumn({ name: 'post_id' })
    post: Post;

    @CreateDateColumn()
    createdAt: Date;
}