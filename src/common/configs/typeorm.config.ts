import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

/* TypeOrm 사용을 위한 Config */
/* 현재는 테스트 용 DB라 괜찮은데, 상용 DB로 변경시 .env로 가져와야함 */
export const typeORMConfig: TypeOrmModuleOptions = {
    type: 'mysql',
    // Error : .env 적용이 안됨 //
    // host: process.env.TYPEORM_HOST,
    // port: Number(process.env.TYPEORM_PORT),
    // username: process.env.TYPEORM_USERNAME,
    // password: process.env.TYPEORM_PASSWORD,
    // database: process.env.TYPEORM_DATABASE,
    // entities: ['dist/**/*.entity.{ts,js}'], // Entity 연결
    // synchronize: true, //배포시 false로 바꿔야함
    // host: '34.64.54.33',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    // password: 'dlalswo8!',
    password: 'dlalswo8',
    database: 'haru',
    entities: ['dist/**/*.entity.{ts,js}'], // Entity 연결
    synchronize: true, //배포시 false로 바꿔야함
    logging: true, // 배포시 false로 바꿔야함
    timezone: 'Asia/Seoul',
    namingStrategy: new SnakeNamingStrategy()
};
