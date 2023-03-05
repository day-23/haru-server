import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard as NestThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerGuard extends NestThrottlerGuard {
  async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    // Your custom implementation here
    // This function is called on every request to check if it should be throttled
    // You can access the request object through `context.switchToHttp().getRequest()`
    // Check whether the user is allowed to make this request with this throttle setting
    return super.handleRequest(context, limit, ttl);
  }
}
