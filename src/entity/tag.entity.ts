import { Entity, PrimaryGeneratedColumn, BaseEntity, ManyToOne, JoinColumn, OneToMany, Column } from 'typeorm';
import { TodoTags } from './todo-tags.entity';
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
}