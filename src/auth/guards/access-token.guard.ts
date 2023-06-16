import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { UserService } from 'src/users/users.service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
    constructor(private usersService: UserService) {}
    
    async canActivate(
        context: ExecutionContext,
      ): Promise<boolean> {
    
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
            
            // TODO: Add more code to validate the access token
            const user = await this.usersService.findOne(decodedToken['id']);
            
            if (!user) {
                return false;
            }

            return true;
        } catch (err) {
            console.error('Failed to verify token', err);
            return false;
        }
    }
}