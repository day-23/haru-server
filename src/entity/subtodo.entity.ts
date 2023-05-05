import { Entity, PrimaryGeneratedColumn, BaseEntity, ManyToOne, JoinColumn, Column} from 'typeorm';
import { Todo } from './todo.entity';

@Entity()
export class Subtodo extends BaseEntity {
    constructor(data?: Partial<Subtodo>) {
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
    subTodoOrder: number;

    @Column({default : false})
    completed: boolean;

    /* 다른 엔터티들간의 관계 */
    @ManyToOne(() => Todo, (todo) => todo.subTodos)
    @JoinColumn({ name: 'todo_id' })
    todo: Todo;
}