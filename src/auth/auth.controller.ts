import { Body, Controller, Get, Headers, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/entity/user.entity';
import { UserService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { KakaoAuthGuard } from './guards/kakao-auth.guard';
import { NaverAuthGuard } from './guards/naver-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('유저 인증 API')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
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

        return {
            id : user.id,
            accessToken: newAccessToken
        };
    }

    @Post('kakao')
    async kakaoLogin(@Headers('authorization') accessToken: string) {
        return await this.authService.validateKakaoUser(accessToken);
    }

    // @Get('kakao/callback')
    // @UseGuards(KakaoAuthGuard)
    // async kakaoCallback(@Req() req, @Res() res) {
    //     let user: User = await this.userService.getUserByEmail(req.user.email);

    //     if (!user) {
    //         user = await this.authService.signUp(req.user.email, req.user.name);
    //     }

    //     const { cookie, accessToken } = await this.authService.getAccessToken(
    //         user,
    //     );

    //     res.setHeader('Set-Cookie', cookie);
    //     return res.send(accessToken);
    // }


    // @Get('google')
    // @UseGuards(GoogleAuthGuard)
    // async googleLogin(@Req() req) {}

    // @Get('google/callback')
    // @UseGuards(GoogleAuthGuard)
    // async googleCallback(@Req() req, @Res() res) {
    //     let user: User = await this.userService.getUserByEmail(req.user.email);

    //     if (!user) {
    //         user = await this.authService.signUp(req.user.email, req.user.name);
    //     }

    //     const { cookie, accessToken } = await this.authService.getAccessToken(
    //         user,
    //     );

    //     res.setHeader('Set-Cookie', cookie);
    //     console.log('google Login');
    //     return res.send(accessToken);
    // }

    // @Get('naver')
    // @UseGuards(NaverAuthGuard)
    // async naverLogin(@Req() req) {}

    // @Get('naver/callback')
    // @UseGuards(NaverAuthGuard)
    // async naverCallback(@Req() req, @Res() res) {
    //     let user: User = await this.userService.getUserByEmail(req.user.email);

    //     if (!user) {
    //         user = await this.authService.naverGetUserInfo(
    //             req.user.accessToken,
    //         );
    //     }

    //     const { cookie, accessToken } = await this.authService.getAccessToken(
    //         user,
    //     );

    //     res.setHeader('Set-Cookie', cookie);
    //     console.log('naver Login');
    //     return res.send(accessToken);
    // }
}
