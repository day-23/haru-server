import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UsePipes, ParseIntPipe, ValidationPipe, DefaultValuePipe, ParseUUIDPipe, UseGuards, Req, } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { User } from 'src/entity/user.entity';
import { UserRepository } from 'src/repository/user.repository';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';


@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    async findAll(): Promise<User[]> {
        return await this.userService.getAllUsers();
    }


    @Get('/:email')
    async findUserByEmail(@Param() params): Promise<User>{
        return await this.userService.getUserByEmail(params.email)
    }

    /* 회원가입 */
    @Post('/signup')
    async signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
        return await this.userService.createUser(createUserDto)
    }

    @UseGuards(LocalAuthGuard)
    @Post('/auth/login')
    async login(@Req() req){
      console.log('Login Route')
      
      return req.user
    }

}