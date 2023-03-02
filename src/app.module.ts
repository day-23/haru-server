import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeORMConfig } from './configs/typeorm.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

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
    providers: [AppService],
})


export class AppModule { }
// export class AppModule implements NestModule {
//     configure(consumer: MiddlewareConsumer) {
//         // consumer
//         //     .apply(AuthMiddleware)
//         //     //exclude 함수는 제외 하고싶은 라우터를 등록합니다.
//         //     .exclude({ path: 'user/create_user', method: RequestMethod.POST }) // 유저 생성
//         //     .exclude({ path: 'user/user_all', method: RequestMethod.GET }) // 유저 전체 조회
//         //     .forRoutes(UserController); // 1.유저 컨트롤러 등록
//         //     // .forRoutes('user'); // 2.유저 컨트롤러 경로 등록 -> 위 1번과 동일
//     }
// }
