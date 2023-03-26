import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Post } from './post.entity';
import { Tag } from './tag.entity';
import { Todo } from './todo.entity';
import { User } from './user.entity';

@Entity()
export class PostTags extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /* 다른 엔터티들간의 관계 */
    /* tagwithtodo : user = N : 1 */
    @ManyToOne(() => User, (user) => user.id, { onDelete:'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    /* postTags : tag = N : 1 */
    @ManyToOne(() => Tag, (tag) => tag.postTags, { onDelete:'CASCADE' })
    @JoinColumn({ name: 'tag_id' })
    tag: Tag;

    /* tagwithpost : 게시글 = N : 1 */
    @ManyToOne(() => Post, (post) => post.id)
    @JoinColumn({ name: 'post_id' })
    post: Post;
}