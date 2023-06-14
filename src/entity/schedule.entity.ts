import { MinLength } from 'class-validator';
import { BaseEntity, BeforeInsert, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Alarm } from './alarm.entity';
import { Category } from './category.entity';
import { Todo } from './todo.entity';
import { User } from './user.entity';

@Entity()
export class Schedule extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 50 })
    content: string;

    @Column({
        nullable: true,
        length: 500
    })
    memo: string;

    @Column()
    isAllDay: boolean;

    @Column({ type: 'datetime', nullable: true })
    @Index()
    repeatStart: Date | null;

    @Column({ type: 'datetime', nullable: true })
    @Index()
    repeatEnd: Date | null;

    @Column({ nullable: true, length: 5 })
    repeatOption: string;

    @Column({ nullable: true, length: 31 })
    repeatValue: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn()
    deletedAt?: Date | null;

    /* 투두 : 사용자 = N:1 */
    @ManyToOne(() => User, (user) => user.schedules, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToOne(() => Todo, (todo) => todo.schedule, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'todo_id' })
    @Index({ unique: true })
    todo: Todo

    /* 스케줄인 경우(todoId == null) category를 갖기 위함 */
    @ManyToOne(() => Category, (category) => category.schedules, { onDelete: "SET NULL" })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    /* 투두 : 알람 = 1:N */
    @OneToMany(() => Alarm, (alarm) => alarm.schedule, { cascade: true })
    alarms: Alarm[];

    @ManyToOne(() => Schedule, { nullable: true , onDelete: "SET NULL" })
    @JoinColumn({ name: 'parent_id' }, )
    parent: Schedule;
}
