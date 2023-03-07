import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class SuccessInterceptor implements NestInterceptor {
    constructor(private reflector: Reflector) {}
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

        console.log('success Interceptor')
        const isPaginatedResponse = this.reflector.get<boolean>('isPaginatedResponse', context.getHandler());

        return next.handle().pipe(
            map((data) => {
              if (isPaginatedResponse) {
                return {
                  success: true,
                  data : data.data,
                  pagination : data.pagination
                };
              } else {
                return {
                  success: true,
                  data,
                };
              }
            }),
          );
    }
}