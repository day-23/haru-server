import { Entity, PrimaryGeneratedColumn, BaseEntity, OneToMany, Column } from 'typeorm';
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

    @Column({ length: 30 })
    content: string;

    /* 태그 : 태그게시물 = 1:N */
    @OneToMany(() => PostTags, (postTags) => postTags.hashtag)
    postTags: PostTags[];
}