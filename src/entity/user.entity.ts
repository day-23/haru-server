import { Alarms } from 'aws-sdk/clients/applicationautoscaling';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Unique,
    OneToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Alarm } from './alarm.entity';
import { Comment } from './comment.entity';
import { UserRelationship } from './follow.entity';
import { Liked } from './liked.entity';
import { Post } from './post.entity';
import { Category } from './category.entity';
import { TodoTags } from './todo-tags.entity';
import { Tag } from './tag.entity';
import { Todo } from './todo.entity';
import { Image } from './image.entity';
import { Schedule } from './schedule.entity';
import { PostTags } from './post-tags.entity';

@Entity({ name: 'user' })
@Unique(['email'])
export class User extends BaseEntity {
    constructor(data?: Partial<User>) {
        super();
        if (data) {
            Object.assign(this, data);
        }
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50, comment: '유저 아이디' })
    email: string;

    @Column({
        nullable: true,
        type: 'varchar',
        length: 255,
        comment: '유저 비밀번호',
    })
    password: string;

    @Column({ nullable: true, type: 'varchar', length: 255, comment: 'salt' }) // nullable : true 추가
    salt: string;

    @Column({ type: 'varchar', length: 30, comment: '유저 이름' })
    name: string;

    @Column({ nullable: true, type: 'tinyint', comment: '유저 나이' }) // nullable : true 추가
    age: number;

    @Column({ nullable: true, type: 'varchar', length: 30, comment: '핸드폰' }) // nullable : true 추가
    phone: string;

    @Column({ length: 100 })
    country: string;

    @Column({ length: 10 })
    timezone: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn()
    deletedAt?: Date | null;

    /* 다른 엔터티들간의 관계 */

    /* 사용자 : 프로필 이미지  -  1:N  */
    @OneToMany(() => Image, (image) => image.user)
    profileImages: Image[];

    /* 사용자 : 팔로우  -  1:N  */
    @OneToMany(() => UserRelationship, (userRelationship) => userRelationship.follower)
    follower: UserRelationship[];

    /* 사용자 : 팔로윙  -  1:N  */
    @OneToMany(() => UserRelationship, (userRelationship) => userRelationship.following)
    following: UserRelationship[];

    /* 사용자 : 게시글  -  1:N  */
    @OneToMany(() => Post, (post) => post.user)
    post_id: Post[];

    /* 사용자 : 댓글 - 1:N */
    @OneToMany(() => Comment, (comment) => comment.user)
    comment_id: Comment[];

    /* 사용자 : Task  -  1:N  */
    @OneToMany(() => Schedule, (schedules) => schedules.user)
    schedules: Schedule[];

    /* 사용자 : Task  -  1:N  */
    @OneToMany(() => Todo, (todos) => todos.user)
    todos: Todo[];

    /* 사용자 : 서브투두 -  1:N  */
    @OneToMany(() => Tag, (subtodo) => subtodo.user)
    subTodos: Tag[];

    /* 사용자 : 태그 -  1:N  */
    @OneToMany(() => Tag, (tag) => tag.user)
    tags: Tag[];

    /* 사용자 : 스케줄 카테고리 -  1:N  */
    @OneToMany(() => Category, (category) => category.user)
    categories: Category[];

    @OneToMany(() => TodoTags, (todoTags) => todoTags.user)
    todoTags: TodoTags[]

    @OneToMany(() => PostTags, (postTags) => postTags.user)
    postTags: PostTags[]

    /* 사용자 : 알람 - 1:N */
    @OneToMany(() => Alarm, (alarm) => alarm.user)
    alarms: Alarms[];

    /* 사용자 : 좋아요 - 1:N */
    @OneToMany(() => Liked, (postlike) => postlike.user)
    postLike: Liked[];
}
