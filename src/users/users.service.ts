import { Injectable } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { UserRepository } from 'src/repository/user.repository';
import { CreateUserDto } from './dto/users.dto';


@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) { }

    async findOne(id: string): Promise<User> {
        return await this.userRepository.findOne(id);
    }

    async getAllUsers(): Promise<User[]> {
        return await this.userRepository.findAll();
    }

    async getUserByEmail(email: string): Promise<User> {
        return await this.userRepository.findByEmail(email);
    }

    async createUser(user: CreateUserDto): Promise<User> {
        return await this.userRepository.create(user);
    }

    async updateUser(id: string, user: User): Promise<User> {
        return await this.userRepository.update(id, user);
    }

    async deleteUser(id: string): Promise<void> {
        return await this.userRepository.delete(id);
    }

    async updateNextOrder(userId: string, fieldName : string) : Promise<User> {
        return await this.userRepository.updateNextOrder(userId, fieldName)
    }
}
