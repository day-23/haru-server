import { Body, Controller, Get, Headers, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { PostService } from 'src/posts/posts.service';

@ApiTags('유저 인증 API')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly postService: PostService
    ) {}

    @Post('refresh')
    async refreshToken(@Headers('authorization') refreshToken: string) {
        // Validate the refresh token
        const payload = await this.authService.validateRefreshToken(refreshToken);

        // Get the user associated with the refresh token
        const user = await this.userService.getUserByEmail(payload.email);

        // Issue a new access token
        const { cookie, accessToken } = await this.authService.getAccessToken(user);
        return { cookie: cookie, accessToken: accessToken };
    }

    @Post('verify-token')
    async verifyToken(@Headers('accessToken') accessToken: string, @Headers('refreshToken') refreshToken: string) {
        // Validate the refresh token
        const payload = await this.authService.validateRefreshToken(refreshToken);
        const { cookie, accessToken: newAccessToken} = await this.authService.createAccessTokenFromRefreshToken(refreshToken);

        //find user by payload email
        const user = await this.userService.getUserByEmail(payload.email);


        console.log(accessToken, refreshToken, user)

        const userInfo = await this.postService.getUserInfoWithOptions(user.id)
        const ret = {
            ...userInfo,
            accessToken: newAccessToken
        }
        return ret
    }

    @Post('kakao')
    async kakaoLogin(@Headers('authorization') accessToken: string) {
        return await this.authService.validateKakaoUser(accessToken);
    }

    @Post('apple')
    async appleSignIn(@Headers('authCode') authCode: string) {
       return await this.authService.validateAppleUser(authCode);
    }


}
