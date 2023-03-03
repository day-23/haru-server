import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CheckApiKeyMiddleware implements NestMiddleware {
    private readonly validApiKeys = [process.env.API_KEY];

    use(req: Request, res: Response, next: NextFunction) {
        const apiKey = req.headers['x-api-key'] as string;

        if (!apiKey || !this.validApiKeys.includes(apiKey)) {
            res.status(401).json({ success: false, message: 'Invalid API key' });
            return;
        }
        next();
    }
}
