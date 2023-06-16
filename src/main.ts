import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import * as expressBasicAuth from 'express-basic-auth';
import { SuccessInterceptor } from './common/interceptors/success.interceptor';
import * as cookieParser from 'cookie-parser';
import { setupSwagger } from './common/swagger/swagger';

/* main */
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    /* 서버 v1 */
    app.setGlobalPrefix('v1');

    //예외 필터 연결
    app.useGlobalFilters(new HttpExceptionFilter());

    // success interceptor -> 필요없는 것 같아 제외
    app.useGlobalInterceptors(new SuccessInterceptor(new Reflector()));

    //Global Middleware 설정 -> Cors 속성 활성화
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        optionsSuccessStatus: 200,
    });

    app.use(cookieParser());

    app.useGlobalPipes(
        new ValidationPipe({
            /**
             * whitelist: DTO에 없은 속성은 무조건 거른다.
             * forbidNonWhitelisted: 전달하는 요청 값 중에 정의 되지 않은 값이 있으면 Error를 발생합니다.
             * transform: 네트워크를 통해 들어오는 데이터는 일반 JavaScript 객체입니다.
             *            객체를 자동으로 DTO로 변환을 원하면 transform 값을 true로 설정한다.
             * disableErrorMessages: Error가 발생 했을 때 Error Message를 표시 여부 설정(true: 표시하지 않음, false: 표시함)
             *                       배포 환경에서는 true로 설정하는 걸 추천합니다.
             */
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            disableErrorMessages: false,
        }),
    );

    //Swagger 환경설정 연결
    if (process.env.MODE == 'dev') {
        //접근 비밀번호 설정
        app.use(
            ['/docs', 'docs-json'],
            expressBasicAuth({
                challenge: true,
                users: {
                    [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD,
                },
            }),
        );
        setupSwagger(app);
    }

    await app.listen(process.env.PORT);
}
bootstrap();
