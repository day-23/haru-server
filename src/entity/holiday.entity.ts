import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Holiday extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    name : string;

    @Column()
    date : string;

    @Column()
    country : string;
}