import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UsePipes, ParseIntPipe, ValidationPipe, DefaultValuePipe, ParseUUIDPipe, UseGuards, Req, UseInterceptors, HttpException, HttpStatus, UploadedFiles, UploadedFile, } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/users.dto';
import { User } from 'src/entity/user.entity';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';


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
        console.log('signUp Route')
        return await this.userService.createUser(createUserDto)
    }

    
    /* 회원탈퇴 */
    @Delete('/:userId')
    @ApiOperation({ summary: '회원탈퇴 API', description: '유저를 생성한다.' })
    async deleteAccount(@Param('userId') userId : string): Promise<void> {
        return await this.userService.deleteUser(userId)
    }

    @UseGuards(LocalAuthGuard)
    @Post('/auth/login')
    async login(@Req() req) {
        return req.user
    }
}