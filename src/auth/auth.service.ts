import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entity/user.entity';
import { UserRepository } from 'src/users/user.repository';
import { CreateUserDto } from 'src/users/dto/users.dto';
import { UserService } from 'src/users/users.service';
import axios from 'axios';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AuthService {
    constructor(
        private userRepository: UserRepository,
        private readonly jwtService: JwtService,
        private userService: UserService,
        private readonly httpService: HttpService,
    ) {}

    /**
     * @author Ryan
     * @description 단일 유저 조회
     * @param email 유저 아이디
     * @param password 유저 비밀번호
     * @returns User
     */
    async validateUser(email: string, password: string): Promise<any> {
        console.log('AuthService');

        const user = await this.userRepository.findByLogin(email, password);

        //사용자가 요청한 비밀번호와 DB에서 조회한 비밀번호 일치여부 검사
        if (user && user.password === password) {
            const { password, ...result } = user;

            //유저 정보를 통해 토큰 값을 생성
            const accessToken = await this.jwtService.sign(result);

            //토큰 값을 추가한다.
            result['token'] = accessToken;

            //비밀번호를 제외하고 유저 정보를 반환
            return result;
        }
        return null;
    }

    async naverGetUserInfo(accessToken: string) {
        const api_url = 'https://openapi.naver.com/v1/nid/me';
        const { data } = await axios.get(api_url, {
            headers: {
                Authorization: 'Bearer ' + accessToken,
            },
        });

        return this.signUp(
            data.response.email,
            data.response.name,
            data.response.mobile,
        );
    }

    async signUp(email: string, name: string, phone: string = '') {
        const createUserDto: CreateUserDto = {
            email: email,
            password: '',
            name: "",
            age: 24,
            phone: phone,
        };

        return await this.userService.createUser(createUserDto);
    }

    async getRefreshToken(user: User) {
        const payload = {
            sub: 'refresh',
            email: user.email,
            id: user.id,
        };

        // Note: You should use a different secret for access and refresh tokens.
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME,
        });

        return refreshToken;
    }

    async validateRefreshToken(token: string) {
        try {
            return this.jwtService.verify(token, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        } catch (error) {
            throw new UnauthorizedException('Refresh token is invalid or expired');
        }
    }

    async getAccessToken(user: User) {
        const payload = {
            email: user.email,
            id: user.id,
        };

        const token = this.jwtService.sign(payload);
        const cookie = `Authentication=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_EXPIRATION_TIME}`;

        console.log(token, cookie)
        return { cookie: cookie, accessToken: token };
    }

    async createAccessTokenFromRefreshToken(refreshToken: string) {
        try {
            const decoded = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });

            if (decoded) {
                const user = await this.userService.getUserByEmail(decoded.email);
                return await this.getAccessToken(user);
            }
        } catch (error) {
            return null;
        }
        return null;
    }


    async verifyKakaoToken(accessToken: string) {
        //parsing bearer token
        const token = accessToken.split(' ')[1];

        const response = await this.httpService
            .get('https://kapi.kakao.com/v2/user/me', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .toPromise();
        return response.data;
    }

    async validateKakaoUser(accessToken: string): Promise<any> {
        // Fetch user information from Kakao's User API
        const kakaoUser = await this.verifyKakaoToken(accessToken);

        // Extract the email from the user's Kakao profile
        const email = kakaoUser.kakao_account.email;

        // Check if a user with this email already exists in your database
        let user = await this.userRepository.findByEmail(email);

        // If the user is logging in for the first time
        if (!user) {
            // Create a new user record in the database
            user = await this.signUp(email, "");
        }

        const refreshToken = await this.getRefreshToken(user);
        const serverAccessToken = await this.getAccessToken(user);

        // Issue your own JWT
        return {
            id: user.id,
            name : user.name,
            ...serverAccessToken,
            refreshToken: refreshToken,
        };
    }
}
