import {
    ForbiddenException,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, UpdateUserDto, UpdateUserOptionPartialDto, UpdateUserSignUpDto } from 'src/users/dto/users.dto';
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
            throw new HttpException('해당 사용자를 찾을 수 없습니다.', HttpStatus.NOT_FOUND)
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

    async updateUserSignUp(id: string, updateUserDto: UpdateUserSignUpDto): Promise<User> {
        await this.repository.update({ id }, { ...updateUserDto });
        return await this.repository.findOne({ where: { id } });
    }


    async delete(id: string): Promise<void> {
        //update user deleted_at
        // await this.repository.update({ id }, { deletedAt: new Date() });

        //delete user
        await this.repository.delete({ id });
    }

    //로그인 유저 조회
    async findByLogin(email: string): Promise<User> {
        const user = await this.repository.findOne({
            where: { email },
        });
        if (!user) {
            throw new ForbiddenException(
                '아이디와 비밀번호를 다시 확인해주세요.',
            );
        }
        return user;
    }

    async updateHaruId(userId: string, haruId: string) {
        //find haruId if exists that not with userId then throw error
        const user = await this.repository.findOne({ where: { haruId } })
        console.log(user, userId, haruId)
        if (user && user.id !== userId || haruId === '') {
            throw new HttpException(
                '이미 존재하는 아이디입니다',
                HttpStatus.CONFLICT
            );
        }

        await this.repository.update({ id: userId }, { haruId: haruId })
    }

    async updateSetting(userId: string, updateUserOptionPartialDto: UpdateUserOptionPartialDto) {
        // return await this.userRepository.updateSetting(userId, updateUserOptionPartialDto)
        const { haruId, ...etc } = updateUserOptionPartialDto
        if (haruId) {
            await this.updateHaruId(userId, haruId)
        }
        await this.repository.update({ id: userId }, { ...etc })
    }

    async updateUserReportCount(userId : string){
        const user = await this.repository.findOne({
            where: { id: userId },
        });

        if(user.reportCount >= 30){
            return await this.repository.update({ id: userId }, { reportCount: 0, isMaliciousUser: true })
        }
        return await this.repository.update({ id: userId }, { reportCount: () => 'report_count + 1' })
    }
}
