import { Entity, PrimaryGeneratedColumn, BaseEntity, Column } from 'typeorm';

@Entity()
export class Holiday extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    content : string;

    @Column()
    repeatStart : string;

    @Column()
    repeatEnd : string;

    @Column()
    country : string;
}