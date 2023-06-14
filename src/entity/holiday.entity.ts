import { Entity, PrimaryGeneratedColumn, BaseEntity, Column } from 'typeorm';

@Entity()
export class Holiday extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: string;

    @Column({ length : 50 })
    content : string;

    @Column()
    repeatStart : string;

    @Column()
    repeatEnd : string;

    @Column({ length: 50 })
    country : string;
}