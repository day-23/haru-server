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

    async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
        try {
            // You should transform the profile into your User entity and feed it into done callback.
            // This is an example. You should replace 'user' with a real User entity from your database.
            const user = {
                email: profile._json.email,
                name: profile.username,
            };

            // Here, you can handle the user data and do whatever you want: 
            // - Save the user into your database
            // - Check if the user already exists and then return it
            // - Return an error if something went wrong

            done(null, user);
        } catch (err) {
            done(err, false);
        }
    }
}
