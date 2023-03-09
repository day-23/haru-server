import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
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

    @CreateDateColumn({ name: 'create_at', comment: '생성일' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'update_at', comment: '수정일' })
    updatedAt: Date;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn({ name: 'delete_at', comment: '삭제일' })
    deletedAt?: Date | null;

    /* 다른 엔터티들간의 관계 */
    /* tagwithtodo : tag = N : 1 */
    @ManyToOne(() => Tag, (tag) => tag.id)
    @JoinColumn({ name: 'tag_id' })
    tag: Tag | string;

    /* tagwithtodo : 투두 = N : 1 */
    @ManyToOne(() => Todo, (todo) => todo.id)
    @JoinColumn({ name: 'todo_id' })
    todo: Todo | string;

}