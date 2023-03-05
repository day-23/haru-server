import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UsePipes, ParseIntPipe, ValidationPipe, DefaultValuePipe, ParseUUIDPipe, UseGuards, Req, UseInterceptors, } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { User } from 'src/entity/user.entity';
import { UserRepository } from 'src/repository/user.repository';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.gaurd';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';


@Controller('user')
@ApiTags('유저 API')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('/test')
    async test(){
        return 'abcd'
    }

    @Get()
    async findAll(): Promise<User[]> {
        return await this.userService.getAllUsers();
    }

    @UseGuards(JwtAuthGuard)
    @Get('/user_all')
    getUserAll(): Promise<User[]> {
        return this.userService.getAllUsers();
    }


    @Get('/:email')
    async findUserByEmail(@Param() params): Promise<User> {
        return await this.userService.getUserByEmail(params.email)
    }

    /* 회원가입 */
    @Post('/signup')
    @ApiOperation({ summary: '회원가입 API', description: '유저를 생성한다.' })
    @ApiCreatedResponse({ description: '유저를 생성한다.', type: User })
    async signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
        return await this.userService.createUser(createUserDto)
    }

    @UseGuards(LocalAuthGuard)
    @Post('/auth/login')
    async login(@Req() req) {
        console.log('Login Route')

        return req.user
    }

}