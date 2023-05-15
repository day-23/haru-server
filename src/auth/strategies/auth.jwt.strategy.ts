import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { UserRepository } from 'src/users/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private userRepository: UserRepository) {
        super({
            //Request에서 JWT 토큰을 추출하는 방법을 설정 -> Authorization에서 Bearer Token에 JWT 토큰을 담아 전송해야한다.
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            //true로 설정하면 Passport에 토큰 검증을 위임하지 않고 직접 검증, false는 Passport에 검증 위임
            ignoreExpiration: false,
            //검증 비밀 값(유출 주위)
            secretOrKey: jwtConstants.secret,
        });
    }

    /**
     * @author Ryan
     * @description 클라이언트가 전송한 Jwt 토큰 정보
     * @param payload 토큰 전송 내용
     */
    async validate(payload: any) {
        // Find the user with this email
        const user = await this.userRepository.findByEmail(payload.email);
        // If user doesn't exist, throw an error
        if (!user) {
            throw new UnauthorizedException();
        }
        // If user exists, return user object
        return user;
    }
}
