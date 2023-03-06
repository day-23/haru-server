import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
    constructor() {
        super({
            clientID: process.env.KAKAO_CLIENT_ID,
            clientSecret: process.env.KAKAO_SECRET_KEY,
            callbackURL: process.env.KAKAO_CALLBACK_URL,
        });
    }

    validate(accessToken: string, refreshToken: string, profile: any) {
        return {
            email: profile._json.email,
            name: profile.username,
        };
    }
}
