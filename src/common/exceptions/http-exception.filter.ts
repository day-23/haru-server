import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        /**
         * @author Ryan
         * @description HttpException에서 전송한 데이터를 추출할 때 사용
         */
        const res: any = exception.getResponse();

        const url: string = request.url
        const error: string = res.error;
        const timestamp: string = new Date().toISOString()

        console.log('요청 url : ', url)
        console.log('error 정보 : ', error)
        console.log('발생 시간 : ', timestamp)

        /* 클라이언트에게 정보를 전달한다. */
        response.status(status).json({
            success: false,
            message: res.message,
        });
    }
} 