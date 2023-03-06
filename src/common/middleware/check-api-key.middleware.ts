import {
    Injectable,
    UnauthorizedException,
    NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/* API KEY Middleware */
@Injectable()
export class CheckApiKeyMiddleware implements NestMiddleware {
    private readonly validApiKeys: string[];

    constructor() {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error('API_KEY environment variable is not set');
        }
        this.validApiKeys = [apiKey];
    }

    use(req: Request, res: Response, next: NextFunction) {
        console.log('validApiKeys', this.validApiKeys);
        const apiKey = req.headers['x-api-key'] as string;

        // if (!apiKey || !this.validApiKeys.includes(apiKey)) {
        //     throw new UnauthorizedException('Invalid API key');
        // }
        next();
    }
}
