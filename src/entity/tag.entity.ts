import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany, Column } from 'typeorm';
import { Post } from './post.entity';
import { TagWithPost } from './tag-with-post.entity';
import { TagWithTodo } from './tag-with-todo.entity';
import { Todo } from './todo.entity';
import { User } from './user.entity';

@Entity()
export class Tag extends BaseEntity {
    constructor(data?: Partial<Tag>) {
        super();
        if (data) {
            Object.assign(this, data);
        }
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    content: string;

    @Column({ default: 0 })
    nextTagWithTodoOrder: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn()
    deletedAt?: Date | null;

    @ManyToOne(() => User, (user) => user.tags)
    @JoinColumn({ name: 'user_id' })
    user: User | string;

    /* 다른 엔터티들간의 관계 */
    /* 태그 : 태그투두 = 1:N */
    @OneToMany(() => TagWithTodo, (tagwithtodo) => tagwithtodo.tag)
    tagWithTodos: TagWithTodo[];

    /* 태그 : 태그게시물 = 1:N */
    @OneToMany(() => TagWithPost, (tagwithpost) => tagwithpost.tag)
    tagWithPost: TagWithPost[];

}