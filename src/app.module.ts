import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeORMConfig } from './common/configs/typeorm.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './common/middleware/log/logger.middleware';
import { CheckApiKeyMiddleware } from './common/middleware/check-api-key.middleware';
import { ThrottlerModule } from '@nestjs/throttler';
import { TodosModule } from './todos/todos.module';
import { TagsModule } from './tags/tags.module';
import { SchedulesModule } from './schedules/schedules.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { CloudWatchLoggerService } from './common/middleware/log/cloudwatch.service';
import { HashtagsModule } from './hashtags/hashtags.module';
import { FriendsModule } from './friends/friends.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './auth/guards/access-token.guard';
import { RedisModule } from './redis/redis.module';

@Module({
    imports: [
        /* .env 파일 사용하기 위한 모듈 전역으로 설정 */
        ConfigModule.forRoot({
            isGlobal: true,
        }),

        /* 초당 너무 많은 요청을 막기 위한 모듈 */
        ThrottlerModule.forRoot({
            ttl: 60, // Time window (in seconds) for which requests will be counted (e.g., 60 seconds)
            limit: 100, // Maximum number of requests allowed per window (e.g., 100 requests per 60 seconds)
        }),

        /* TypeOrm */
        TypeOrmModule.forRoot(typeORMConfig),
        UsersModule,
        AuthModule,
        TodosModule,
        TagsModule,
        SchedulesModule,
        PostsModule,
        CommentsModule,
        HashtagsModule,
        FriendsModule,
        RedisModule
    ],
    controllers: [AppController],
    providers: [AppService, CloudWatchLoggerService, CheckApiKeyMiddleware,
        {
            provide: APP_GUARD,
            useClass: AccessTokenGuard,
        },
    ],
})
export class AppModule implements NestModule {
    /* 개발 환경의 경우 서버에서 로그 찍어주기 */
    private readonly isDev: boolean = process.env.MODE === 'dev' ? true : false;
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(LoggerMiddleware)
            .forRoutes('*')
            // .apply(CheckApiKeyMiddleware)
            // .forRoutes('*');
    }
}
