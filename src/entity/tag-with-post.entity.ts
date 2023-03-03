import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Post } from './post.entity';
import { Tag } from './tag.entity';
import { Todo } from './todo.entity';
import { User } from './user.entity';

@Entity()
export class TagWithPost extends BaseEntity {
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
    /* tagwithpost : tag = N : 1 */
    @ManyToOne(() => Tag, (tag) => tag.id)
    @JoinColumn({ name: 'tag_id' })
    tag: Tag;

    /* tagwithpost : 게시글 = N : 1 */
    @ManyToOne(() => Post, (post) => post.id)
    @JoinColumn({ name: 'post_id' })
    post: Post;

}