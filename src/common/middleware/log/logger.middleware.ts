import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { CloudWatchLoggerService } from './cloudwatch.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(private readonly cloudWatchLogger: CloudWatchLoggerService) {}
    
    private logger = new Logger('HTTP')

    use(req: Request, res: Response, next: NextFunction) {
        res.on('finish', () => {
            const message = `${req.ip} ${req.method} ${req.originalUrl} ${res.statusCode}`;
            // this.cloudWatchLogger.log(message, 'HTTP');
            this.logger.log(message)
        })
        next();
    }
}
