import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(): string {
        return 'Hello Haru! deploy! ^_^ 20231015';
    }
}
