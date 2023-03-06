import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { CreateUserDto } from 'src/users/dto/users.dto';
import { UserService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';

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
            const createUserDto: CreateUserDto = {
                email: req.user.email,
                password: '',
                name: req.user.name,
                age: 24,
            };
            user = await this.userService.createUser(createUserDto);
        }

        const cookie = this.authService.login(user);

        res.setHeader('Set-Cookie', cookie);
        console.log('google Login');
        return res.send(user);
    }
}
