import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/auth.local.strategy';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/repository/user.repository';
import { User } from 'src/entity/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User]), PassportModule],
    providers: [AuthService, LocalStrategy, UserRepository],
})
export class AuthModule { }
