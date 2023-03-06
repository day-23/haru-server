import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { UserService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { NaverAuthGuard } from './guards/naver-auth.guard';

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
}
