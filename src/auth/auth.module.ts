import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/auth.local.strategy';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/repository/user.repository';
import { User } from 'src/entity/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './strategies/auth.jwt.strategy';
import { GoogleStrategy } from './strategies/auth.google.strategy';
import { AuthController } from './auth.controller';
import { UserService } from 'src/users/users.service';
import { NaverStrategy } from './strategies/auth.naver.strategy';

@Module({
    controllers: [AuthController],
    imports: [
        TypeOrmModule.forFeature([User]),
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
    ],
})
export class AuthModule {}
