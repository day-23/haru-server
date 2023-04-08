import { Module } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from 'src/entity/follow.entity';
import { FollowRepository } from './follows.repository';
import { User } from 'src/entity/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Follow, User])],
    controllers: [FollowsController],
    providers: [{
        provide: 'FollowServiceInterface',
        useClass: FollowsService,
    },
    {
        provide: 'FollowRepositoryInterface',
        useClass: FollowRepository,
    }]
})
export class FollowsModule { }
