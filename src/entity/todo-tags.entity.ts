import { Entity, PrimaryGeneratedColumn, BaseEntity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Tag } from './tag.entity';
import { Todo } from './todo.entity';
import { User } from './user.entity';


@Entity()
export class TodoTags extends BaseEntity {
    constructor(data?: Partial<TodoTags>) {
        super();
        if (data) {
            Object.assign(this, data);
        }
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ default: 0 }) /* 해당 태그에서 투두의 order */
    todoOrder: number;

    @Column({ default: 0 }) /* 해당 투두에서 태그의 order */
    tagOrder: number;

    /* 다른 엔터티들간의 관계 */
    /* tagwithtodo : user = N : 1 */
    @ManyToOne(() => User, (user) => user.todoTags, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    /* tagwithtodo : tag = N : 1 */
    @ManyToOne(() => Tag, (tag) => tag.todoTags, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tag_id' })
    tag: Tag;

    /* tagwithtodo : 투두 = N : 1 */
    @ManyToOne(() => Todo, (todo) => todo.todoTags, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'todo_id' })
    todo: Todo;
}