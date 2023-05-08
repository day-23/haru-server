import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';

dotenv.config();

/* TypeOrm 사용을 위한 Config */
export const typeORMConfig: TypeOrmModuleOptions = {
    type: 'mysql',
    host: process.env.TYPEORM_HOST,
    password: process.env.TYPEORM_PASSWORD,
    port: Number(process.env.TYPEORM_PORT),
    username: process.env.TYPEORM_USERNAME,
    database: process.env.TYPEORM_DATABASE,
    entities: ['dist/**/*.entity.{ts,js}'], // Entity 연결
    synchronize: true, //배포시 false로 바꿔야함
    logging: true, // 배포시 false로 바꿔야함
    timezone: 'Asia/Seoul',
    namingStrategy: new SnakeNamingStrategy()
};
