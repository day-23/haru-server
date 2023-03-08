import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany, Column } from 'typeorm';
import { Alarm } from './alarm.entity';
import { SubTodo } from './sub-todo.entity';
import { TagWithTodo } from './tag-with-todo.entity';
import { TodoLog } from './todolog.entity';
import { User } from './user.entity';

@Entity({ name: 'todo' })
export class Todo extends BaseEntity {
    constructor(data?: Partial<Todo>) {
        super();
        if (data) {
            Object.assign(this, data);
        }
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    content: string;

    @Column({
        nullable: true,
        length: 500
    })
    memo: string;

    /* 오늘 할일 */
    @Column()
    todayTodo: boolean;

    /* 중요한 */
    @Column()
    flag: boolean;

    @Column({ nullable: true })
    repeatOption: string;

    @Column({length: 7, nullable: true, })
    repeat: string;

    @CreateDateColumn({ name: 'repeat_end', comment: '구간 끝', nullable: true, })
    repeatEnd: Date;

    @CreateDateColumn({ name: 'end_date', comment: '마감일' })
    endDate : Date;

    @CreateDateColumn({ name: 'create_at', comment: '생성일' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'update_at', comment: '수정일' })
    updatedAt: Date;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn({ name: 'delete_at', comment: '삭제일' })
    deletedAt?: Date | null;


    /* 다른 엔터티들간의 관계 */
    /* 투두 : 사용자 = N:1 */
    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user: string;

    /* 투두 : 투두로그 = 1:N */
    @OneToMany(() => TodoLog, (todolog) => todolog.id)
    todolog: TodoLog[];

    /* 태그 : 태그투두 = 1:N */
    @OneToMany(() => TagWithTodo, (tagwithtodo) => tagwithtodo.id)
    tagWithTodo: TagWithTodo[];

    /* 투두 : 하위항목 = 1:N */
    @OneToMany(() => SubTodo, (subtodo) => subtodo.id)
    subtodo: SubTodo[];

    /* 투두 : 알람 = 1:N */
    @OneToMany(()=> Alarm, (alarm)=>alarm.id)
    alarm : Alarm[];

}