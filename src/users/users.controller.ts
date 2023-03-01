import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UsePipes, ParseIntPipe, ValidationPipe, DefaultValuePipe, ParseUUIDPipe, } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { User } from 'src/entity/user.entity';
import { UserRepository } from 'src/repository/user.repository';


@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    async findAll(): Promise<User[]> {
      return await this.userService.getAllUsers();
    }
}