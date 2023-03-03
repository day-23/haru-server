import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CheckApiKeyMiddleware implements NestMiddleware {
    private readonly validApiKeys = ['3b9eb1c9-4bce-462c-a4f5-67daa4fa5574'];

    use(req: Request, res: Response, next: NextFunction) {
        const apiKey = req.headers['x-api-key'] as string;

        if (!apiKey || !this.validApiKeys.includes(apiKey)) {
            res.status(401).json({ success: false, message: 'Invalid API key' });
            return;
        }
        next();
    }
}
