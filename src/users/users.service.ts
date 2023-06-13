import { Injectable } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { UserRepository } from 'src/users/user.repository';
import { CreateUserDto, UpdateUserDto, UpdateUserOptionPartialDto } from './dto/users.dto';
import * as jwt from 'jsonwebtoken';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository,
        private readonly httpService: HttpService,
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

    async deleteAppleUser(id: string, accessToken: string, refreshToken: string): Promise<void> {
        //apple revoke token then delete id
        const appleIdUrl = 'https://appleid.apple.com/auth/revoke';
        const clientId = process.env.APPLE_CLIENT_ID;
        const teamId = process.env.APPLE_TEAM_ID;
        const keyId = process.env.APPLE_KEY_ID;

        // The private key contents are stored as a Base64 encoded string
        const keyFileContentBase64 = process.env.APPLE_PRIVATE_KEY_BASE64;
        // Decode the Base64 string to get the actual key contents
        const keyFileContent = keyFileContentBase64.replace(/\\n/g, '\n');
        
        // Generate the client secret
        const clientSecret = jwt.sign({}, keyFileContent, {
            algorithm: 'ES256',
            expiresIn: '1h', // Apple accepts client secret JWTs with an expiry time of up to 6 months.
            audience: 'https://appleid.apple.com',
            issuer: teamId,
            subject: clientId,
            keyid: keyId
        });

        const tokens = [accessToken, refreshToken]

        tokens.forEach(async (token) => {
            const params = new URLSearchParams();
            params.append('client_id', clientId);
            params.append('client_secret', clientSecret);
            params.append('token', token);
            try {
                const response = await this.httpService.post(appleIdUrl, params).toPromise();
            } catch (error) {
                console.error(error.message);
                console.error(error.response?.data);  // Log the response body
            }
        })
        return await this.userRepository.delete(id);
    }

    async updateHaruId(userId: string, haruId: string){
        return await this.userRepository.updateHaruId(userId, haruId);
    }

    async updateSetting(userId: string, updateUserOptionPartialDto: UpdateUserOptionPartialDto) {
        return await this.userRepository.updateSetting(userId, updateUserOptionPartialDto)
    }
}
