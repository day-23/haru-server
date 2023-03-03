import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Unique, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Follow } from './follow.entity';
import { Following } from './following.entity';
import { Post } from './post.entity';
import { ProfileImage } from './profile-image.entity';
import { Category } from './schedule-category.entity';
import { Tag } from './tag.entity';
import { Todo } from './todo.entity';

@Entity({ name: 'user' })
@Unique(['email'])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50, comment: '유저 아이디' })
    email: string;

    @Column({ type: 'varchar', length: 255, comment: '유저 비밀번호' })
    password: string;

    @Column({ nullable: true, type: 'varchar', length: 255, comment: 'salt' })
    salt: string;

    @Column({ type: 'varchar', length: 30, comment: '유저 이름' })
    name: string;

    @Column({ type: 'tinyint', comment: '유저 나이' })
    age: number;

    @Column({ type: 'varchar', length: 30, comment: '핸드폰' })
    phone: string;

    @CreateDateColumn({ name: 'create_at', comment: '생성일' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'update_at', comment: '수정일' })
    updatedAt: Date;

    /* deletedAt이 null이 아니면 삭제되었다는 뜻 */
    @DeleteDateColumn({ name: 'delete_at', comment: '삭제일' })
    deletedAt?: Date | null;


    /* 다른 엔터티들간의 관계 */

    /* 사용자 : 프로필 이미지  -  1:N  */
    @OneToMany(() => ProfileImage, (profileImage) => profileImage.id)
    profile_image_id: ProfileImage[];

    /* 사용자 : 팔로우  -  1:N  */
    @OneToMany(() => Follow, (follow) => follow.id)
    follow_id: Post[];

    /* 사용자 : 팔로윙  -  1:N  */
    @OneToMany(() => Following, (following) => following.id)
    following_id: Post[];

    /* 사용자 : 게시글  -  1:N  */
    @OneToMany(() => Post, (post) => post.id)
    post_id: Post[];

    /* 사용자 : 투두  -  1:N  */
    @OneToMany(() => Todo, (todo) => todo.id)
    todo_id: Todo[];

    /* 사용자 : 태그 -  1:N  */
    @OneToMany(() => Tag, (tag) => tag.id)
    tag_id: Tag[];

    /* 사용자 : 스케줄 카테고리 -  1:N  */
    @OneToMany(() => Category, (category) => category.id)
    category_id: Tag[];

    /* 사용자 : 스케줄 -  1:N  */
    @OneToMany(() => Tag, (schedule) => schedule.id)
    schedule: Tag[];
}