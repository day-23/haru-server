import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany, Column } from 'typeorm';

@Entity()
export class Template extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    originalName: string;

    @Column()
    mimeType: string;

    @Column("decimal", { precision: 10, scale: 2 })
    size: number;

    @Column()
    url: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}