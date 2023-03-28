import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/entity/category.entity';
import { CategoryRepository } from 'src/repository/category.repository';
import { User } from 'src/entity/user.entity';
import { UserService } from 'src/users/users.service';
import { UserRepository } from 'src/repository/user.repository';
import { AwsModule } from 'src/aws/aws.module';
import { Image } from 'src/entity/image.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Category, ])],
    controllers: [CategoriesController],
    providers: [CategoriesService, CategoryRepository],
    exports : [CategoriesService, CategoryRepository]
})
export class CategoriesModule { }
