import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany, Column, Index, OneToOne } from 'typeorm';
import { Comment } from './comment.entity';
import { Image } from './image.entity';
import { Liked } from './liked.entity';
import { PostTags } from './post-tags.entity';
import { User } from './user.entity';
import { Report } from './report.entity';
import { Template } from './template.entity';

@Entity()
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /* 다른 엔터티들간의 관계 */
    /* 게시글 : 사용자 = N:1 */
    @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    content: string

    @Index()
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn()
    deletedAt?: Date | null;

    /* 게시글 : 사진 = 1:N */
    @OneToMany(() => Image, (postImage) => postImage.post)
    postImages: Image[];

    /* 게시글 : 댓글 = 1:N */
    @OneToMany(() => Comment, (comment) => comment.post)
    comments: Comment[]

    /* 게시물 : 태그게시물 = 1:N */
    @OneToMany(() => PostTags, (postTags) => postTags.post)
    postTags: PostTags[];

    /* 게시물 : 좋아요 = 1:N */
    @OneToMany(() => Liked, (like) => like.post)
    liked: Liked[];

    @OneToMany(()=> Report, (report) => report.post)
    report: Report[];

    @ManyToOne(()=> Template, (template) => template.posts, { onDelete: 'CASCADE' })
    template: Template

    likedCount: number;
    commentCount : number;
}