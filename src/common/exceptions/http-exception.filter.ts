import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { UnauthorizaedException } from './unauthorized.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        if (exception instanceof UnauthorizaedException) {
            return response.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                timestamp: new Date().toISOString(),
                message: 'Invalid API key',
            });
        }

        console.log("here")
        const status = exception.getStatus();
        const error = exception.getResponse() as
            | string
            | { error: string; statusCode: number; message: string | string[] };

        console.log('http-exception:', exception)


        if (typeof error === 'string') {
            response.status(status).json({
                success: false,
                // timestamp: new Date().toISOString(),
                path: request.url,
                error,
            });
        } else {
            response.status(status).json({
                success: false,
                // timestamp: new Date().toISOString(),
                error: {
                    code: error.statusCode,
                    message: error.error,
                    devMessage: error.message
                },
            });
        }
    }
}