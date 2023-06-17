import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { UserService } from 'src/users/users.service';
import { Redis } from 'ioredis';

@Injectable()
export class AccessTokenGuard implements CanActivate {
    constructor(
        private usersService: UserService,
        // @Inject('Redis') private readonly redis: Redis, 
        ) {}
    
    async canActivate(
        context: ExecutionContext,
      ): Promise<boolean> {
        // 임시 처리
        return true

        const controllerName = context.getClass().name;

        // If the controller is the one we want to exclude
        if (controllerName === 'AuthController') {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split(' ')[1];

        if (!token) {
            return false;
        }

        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

            // Check Redis first
            let userId 
            // = await this.redis.get(token);

            console.log('debug reds', userId)

            // If not in Redis, validate with userService and add to Redis
            if (!userId) {
                const user = await this.usersService.findOne(decodedToken['id']);
                if (!user) {
                    return false;
                }

                userId = user.id;

                // Set the value in Redis for subsequent requests 60초 * 30 -> 60분
                // await this.redis.set(token, userId, 'EX', 60 * 60);
            }

            // Validate the user ID from Redis or userService
            if (userId !== decodedToken['id']) {
                return false;
            }

            return true;
        } catch (err) {
            console.error('Failed to verify token', err);
            return false;
        }
    }
}