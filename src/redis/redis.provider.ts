import { Provider } from "@nestjs/common";

const Redis = require('ioredis');

export const RedisProvider: Provider = {
    provide: 'Redis',
    useFactory: (): typeof Redis => {
        return new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
        });
    },
};
