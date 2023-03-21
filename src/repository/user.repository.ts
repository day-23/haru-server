import {
    ForbiddenException,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/users/dto/users.dto';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(User) private readonly repository: Repository<User>,
    ) { }

    async findOne(id: string): Promise<User> {
        try {
            return await this.repository.findOneOrFail({ where: { id } });
        } catch (error) {
            throw new HttpException(
                {
                    message: '해당 id의 사용자를 찾을 수 없습니다.'
                },
                HttpStatus.NOT_FOUND
            )
        }
    }
    async findAll(): Promise<User[]> {
        return await this.repository.find();
    }

    async findByEmail(email: string): Promise<User> {
        return await this.repository.findOne({ where: { email } });
    }

    async create(user: CreateUserDto): Promise<User> {
        try {
            return await this.repository.save({ ...user });
        } catch (error) {
            throw new HttpException(
                {
                    message: 'SQL에러',
                    error: error.sqlMessage,
                },
                HttpStatus.FORBIDDEN,
            );
        }
    }

    async update(id: string, user: User): Promise<User> {
        await this.repository.update(id, user);
        return await this.repository.findOne({ where: { id } });
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    //로그인 유저 조회
    async findByLogin(email: string, password: string): Promise<User> {
        const user = await this.repository.findOne({
            where: { email, password },
        });
        if (!user) {
            throw new ForbiddenException(
                '아이디와 비밀번호를 다시 확인해주세요.',
            );
        }
        return user;
    }

    async updateNextOrder(userId: string, fieldName: string): Promise<User> {
        const user = await this.repository.findOne({ where: { id : userId } });
        if (!user) {
            throw new Error(`User with id ${userId} not found`);
        }
        user[fieldName] -= 1;
    
        return await this.repository.save(user);
    }
    
}
