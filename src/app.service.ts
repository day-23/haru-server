import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(): string {
        return 'Hello Haru! with docker-compose! 6_19';
    }
}
