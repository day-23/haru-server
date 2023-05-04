import {
    ForbiddenException,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, UpdateUserDto } from 'src/users/dto/users.dto';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { UpdateProfileDto } from './dto/profile.dto';

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(User) private readonly repository: Repository<User>
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

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        await this.repository.update({ id }, { ...updateUserDto });
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

    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<void> {
        const { name } = updateProfileDto

        //find user by name and if already exists that name is not user's name throw error
        const user = await this.repository.findOne({ where: { name } })

        // if (user && user.id !== userId) {
        //     throw new HttpException(
        //         '이미 존재하는 닉네임입니다.',
        //         HttpStatus.CONFLICT,
        //     );
        // }
        
        await this.repository.update({ id: userId }, { ...updateProfileDto });
    }
}
