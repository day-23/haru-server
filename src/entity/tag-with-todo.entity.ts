import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable, Column } from 'typeorm';
import { Post } from './post.entity';
import { Tag } from './tag.entity';
import { Todo } from './todo.entity';
import { User } from './user.entity';

@Entity()
export class TagWithTodo extends BaseEntity {
    constructor(data?: Partial<TagWithTodo>) {
        super();
        if (data) {
            Object.assign(this, data);
        }
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({default : 0}) /* 해당 태그에서 투두의 order */
    order: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn()
    deletedAt?: Date | null;

    /* 다른 엔터티들간의 관계 */
    /* tagwithtodo : user = N : 1 */
    @ManyToOne(() => User, (user) => user.tagWithTodos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User | string;

    /* tagwithtodo : tag = N : 1 */
    @ManyToOne(() => Tag, (tag) => tag.tagWithTodos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tag_id' })
    tag: Tag | string;

    /* tagwithtodo : 투두 = N : 1 */
    @ManyToOne(() => Todo, (todo) => todo.tagWithTodos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'todo_id' })
    todo: Todo | string;
}