import { Injectable } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { UserRepository } from 'src/repository/user.repository';


@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<User> {
    return await this.userRepository.findById(id);
  }

  async createUser(user: User): Promise<User> {
    return await this.userRepository.create(user);
  }

  async updateUser(id: string, user: User): Promise<User> {
    return await this.userRepository.update(id, user);
  }

  async deleteUser(id: string): Promise<void> {
    return await this.userRepository.delete(id);
  }
}
