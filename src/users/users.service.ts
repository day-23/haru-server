import { Injectable } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { UserRepository } from 'src/users/user.repository';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';


@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository
    ) { }

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

    async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        return await this.userRepository.update(id, updateUserDto);
    }

    async deleteUser(id: string): Promise<void> {
        return await this.userRepository.delete(id);
    }

    async updateHaruId(userId: string, haruId: string){
        return await this.userRepository.updateHaruId(userId, haruId);
    }
}
