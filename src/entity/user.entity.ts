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
import { Liked } from './liked.entity';
import { Post } from './post.entity';
import { Category } from './category.entity';
import { TodoTags } from './todo-tags.entity';
import { Tag } from './tag.entity';
import { Todo } from './todo.entity';
import { Image } from './image.entity';
import { Schedule } from './schedule.entity';
import { PostTags } from './post-tags.entity';
import { Friend } from './friend.entity';

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

    @Column({ type: 'varchar', length: 255, comment: '유저의 소셜 가입 이메일' })
    email: string;

    @Column({ nullable : true, type: 'varchar', length: 50, comment: '유저 아이디 사용자 검색용', default : null})
    haruId: string;

    @Column({ type: 'varchar', length: 10, comment: '유저 이름', nullable:true })
    socialAccountType: string;

    @Column({ type: 'varchar', length: 30, comment: '유저 이름' })
    name: string;

    @Column({ type: 'varchar', length: 100, comment: '자기소개', default: '' })
    introduction: string;

    @Column({ type: 'varchar', length: 255, comment: '프로필 이미지 url', default: null, nullable: true })
    profileImageUrl: string;

    @Column({ length: 100, default: 'kor' })
    country: string;

    @Column({ length: 30, default: 'Asia/Seoul'})
    timezone: string;

    @Column({ default: true })
    isPublicAccount: boolean;

    @Column({ default: true })
    isPostBrowsingEnabled : boolean;

    // 피드 좋아요, 코멘트 허용 여부
    // 전체 : 2
    // 친구만 : 1
    // 아무도 : 0
    @Column({
        type: "tinyint",
        unsigned: true,
        default : 2
    })
    isAllowFeedLike: number;

    @Column({
        type: "tinyint",
        unsigned: true,
        default : 2
    })
    isAllowFeedComment: number;

    @Column({ default: true })
    isAllowSearch: boolean;

    @Column({ default: true })
    isAlarmOn: boolean;

    @Column({ default: null })
    morningAlarmTime: Date;

    @Column({ default: null })
    nightAlarmTime: Date;

    @Column({ default: true })
    isScheduleAlarmOn: boolean;

    @Column({ default: false })
    isMaliciousUser: boolean;

    @Column({default : false })
    isSignUp : boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ default: 0 })
    reportCount: number;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn()
    deletedAt?: Date | null;

    /* 다른 엔터티들간의 관계 */

    /* 사용자 : 프로필 이미지  -  1:N  */
    @OneToMany(() => Image, (image) => image.user)
    profileImages: Image[];

    @OneToMany(() => Friend, (friend) => friend.requester)
    requesters: Friend[];

    /* 사용자 : 팔로윙  -  1:N  */
    @OneToMany(() => Friend, (freind) => freind.acceptor)
    acceptors: Friend[];

    /* 사용자 : 게시글  -  1:N  */
    @OneToMany(() => Post, (post) => post.user)
    posts: Post[];

    /* 사용자 : 댓글 - 1:N */
    @OneToMany(() => Comment, (comments) => comments.user)
    comments: Comment[];

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
    alarms: Alarm[];

    /* 사용자 : 좋아요 - 1:N */
    @OneToMany(() => Liked, (postlike) => postlike.user)
    postLike: Liked[];
}
