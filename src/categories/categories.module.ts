import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/entity/category.entity';
import { CategoryRepository } from 'src/repository/category.repository';
import { User } from 'src/entity/user.entity';
import { UserService } from 'src/users/users.service';
import { UserRepository } from 'src/repository/user.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Category, User])],
    controllers: [CategoriesController],
    providers: [CategoriesService, CategoryRepository, UserRepository, UserService],
})
export class CategoriesModule { }
