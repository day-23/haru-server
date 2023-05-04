import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from './user.entity';

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