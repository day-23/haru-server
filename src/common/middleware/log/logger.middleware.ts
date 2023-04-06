import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { CloudWatchLoggerService } from './cloudwatch.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(private readonly cloudWatchLogger: CloudWatchLoggerService) { }

    private logger = new Logger('HTTP')

    use(req: Request, res: Response, next: NextFunction) {
        const startTime = Date.now();
        res.on('finish', () => {
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            const message = `${req.ip} ${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms`;

            const logData = {
                message,
                context: 'HTTP',
                headers: req.headers,
                responseHeaders: res.getHeaders(),
                requestBody: req.body,
                responseBody: res.locals.responseBody,
            };

            // Determine log level based on status code
            const statusCode = res.statusCode;
            if (statusCode >= 500) {
                this.cloudWatchLogger.error(logData, 'HTTP');
            } else if (statusCode >= 400) {
                this.cloudWatchLogger.warn(logData, 'HTTP');
            } else {
                this.cloudWatchLogger.log(logData, 'HTTP');
            }

            this.logger.log(message);
        })
        next();
    }
}
