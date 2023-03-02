import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeORMConfig } from './configs/typeorm.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AwsService } from './aws/aws.service';

@Module({
    imports: [
        /* .env 파일 사용하기 위한 모듈 전역으로 설정 */
        ConfigModule.forRoot({
            isGlobal: true
        }),

        /* TypeOrm */
        TypeOrmModule.forRoot(typeORMConfig),
        UsersModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [AppService, AwsService],
})


export class AppModule implements NestModule {
    /* 개발 환경의 경우 서버에서 로그 찍어주기 */
    private readonly isDev: boolean = process.env.MODE === 'dev' ? true : false;
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(LoggerMiddleware)
            .forRoutes('*');
    }
}