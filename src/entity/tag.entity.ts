import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany, Column } from 'typeorm';
import { Post } from './post.entity';
import { TagWithPost } from './tag-with-post.entity';
import { TagWithTodo } from './tag-with-todo.entity';
import { Todo } from './todo.entity';
import { User } from './user.entity';

@Entity()
export class Tag extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    content: string;

    @CreateDateColumn({ name: 'create_at', comment: '생성일' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'update_at', comment: '수정일' })
    updatedAt: Date;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn({ name: 'delete_at', comment: '삭제일' })
    deletedAt?: Date | null;

    /* 다른 엔터티들간의 관계 */
    /* 태그 : 태그투두 = 1:N */
    @OneToMany(() => TagWithTodo, (tagwithtodo) => tagwithtodo.id)
    tagWithTodo: TagWithTodo[];

    /* 태그 : 태그게시물 = 1:N */
    @OneToMany(() => TagWithPost, (tagwithpost) => tagwithpost.id)
    tagWithPost: TagWithPost[];

}