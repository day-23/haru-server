import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';

@Injectable()
export class UserRepository {
    constructor(@InjectRepository(User) private readonly repository: Repository<User>) { }

    async findAll(): Promise<User[]> {
        return await this.repository.find();
    }

    async findById(id: string): Promise<User> {
        return await this.repository.findOne({ where: { id } });
    }

    async create(user: User): Promise<User> {
        return await this.repository.save(user);
    }

    async update(id: string, user: User): Promise<User> {
        await this.repository.update(id, user);
        return await this.repository.findOne({ where: { id } });
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

}