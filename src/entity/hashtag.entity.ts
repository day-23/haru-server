import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany, Column } from 'typeorm';
import { PostTags } from './post-tags.entity';

@Entity()
export class Hashtag extends BaseEntity {
    constructor(data?: Partial<Hashtag>) {
        super();
        if (data) {
            Object.assign(this, data);
        }
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    content: string;

    /* 태그 : 태그게시물 = 1:N */
    @OneToMany(() => PostTags, (postTags) => postTags.hashtag)
    postTags: PostTags[];
}