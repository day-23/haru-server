import { Body, Controller, Get, Headers, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/entity/user.entity';
import { UserService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { KakaoAuthGuard } from './guards/kakao-auth.guard';
import { NaverAuthGuard } from './guards/naver-auth.guard';

@ApiTags('유저 인증 API')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) {}

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleLogin(@Req() req) {}

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleCallback(@Req() req, @Res() res) {
        let user: User = await this.userService.getUserByEmail(req.user.email);

        if (!user) {
            user = await this.authService.signUp(req.user.email, req.user.name);
        }

        const { cookie, accessToken } = await this.authService.getAccessToken(
            user,
        );

        res.setHeader('Set-Cookie', cookie);
        console.log('google Login');
        return res.send(accessToken);
    }

    @Get('naver')
    @UseGuards(NaverAuthGuard)
    async naverLogin(@Req() req) {}

    @Get('naver/callback')
    @UseGuards(NaverAuthGuard)
    async naverCallback(@Req() req, @Res() res) {
        let user: User = await this.userService.getUserByEmail(req.user.email);

        if (!user) {
            user = await this.authService.naverGetUserInfo(
                req.user.accessToken,
            );
        }

        const { cookie, accessToken } = await this.authService.getAccessToken(
            user,
        );

        res.setHeader('Set-Cookie', cookie);
        console.log('naver Login');
        return res.send(accessToken);
    }

    // @Get('kakao')
    // @UseGuards(KakaoAuthGuard)
    // async kakaoLogin(@Req() req) {}

    @Post('kakao')
    async kakaoLogin(@Headers('authorization') accessToken: string) {
        const kakaoUser = await this.authService.validateKakaoUser(accessToken);
        // implement your sign-up / login logic here
        // you can use kakaoUser to find or create a user in your database
    }

    @Get('kakao/callback')
    @UseGuards(KakaoAuthGuard)
    async kakaoCallback(@Req() req, @Res() res) {
        let user: User = await this.userService.getUserByEmail(req.user.email);

        if (!user) {
            user = await this.authService.signUp(req.user.email, req.user.name);
        }

        const { cookie, accessToken } = await this.authService.getAccessToken(
            user,
        );

        res.setHeader('Set-Cookie', cookie);
        console.log('kakao Login');
        return res.send(accessToken);
    }
}
