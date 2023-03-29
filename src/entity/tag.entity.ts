import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany, Column } from 'typeorm';
import { Post } from './post.entity';
import { PostTags } from './post-tags.entity';
import { TodoTags } from './todo-tags.entity';
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

    @ManyToOne(() => User, (user) => user.tags)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    content: string;

    @Column({ nullable: true })
    tagOrder: number;

    @Column({ default: true })
    isSelected: boolean

    /* 다른 엔터티들간의 관계 */
    /* 태그 : 태그투두 = 1:N */
    @OneToMany(() => TodoTags, (todoTags) => todoTags.tag)
    todoTags: TodoTags[];

    /* 태그 : 태그게시물 = 1:N */
    @OneToMany(() => PostTags, (postTags) => postTags.tag)
    postTags: PostTags[];

}