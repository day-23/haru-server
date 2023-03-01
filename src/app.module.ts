import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        /* .env 파일 사용하기 위한 모듈 전역으로 설정 */
        ConfigModule.forRoot({
            isGlobal: true
        }),

        /* TypeOrm */
        TypeOrmModule.forRoot({
            type: process.env.TYPEORM_TYPE as any,
            host: process.env.TYPEORM_HOST,
            port: Number(process.env.TYPEORM_PORT),
            username: process.env.TYPEORM_USERNAME,
            password: process.env.TYPEORM_PASSWORD,
            database: process.env.TYPEORM_DATABASE,
            entities: [],
            synchronize: true, //배포시 false로 바꿔야함
        }),


    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
