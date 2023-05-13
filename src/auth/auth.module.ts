import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/auth.local.strategy';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/users/user.repository';
import { User } from 'src/entity/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './strategies/auth.jwt.strategy';
import { GoogleStrategy } from './strategies/auth.google.strategy';
import { AuthController } from './auth.controller';
import { UserService } from 'src/users/users.service';
import { NaverStrategy } from './strategies/auth.naver.strategy';
import { KakaoStrategy } from './strategies/auth.kakao.strategy';
import { Image } from 'src/entity/image.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
    controllers: [AuthController],
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([User, Image]),
        PassportModule,
        JwtModule.register({
            //토큰 서명 값 설정
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '1h' },
        }),
    ],
    providers: [
        AuthService,
        LocalStrategy,
        UserRepository,
        JwtStrategy,
        GoogleStrategy,
        UserService,
        NaverStrategy,
        KakaoStrategy,
    ],
})
export class AuthModule {}
