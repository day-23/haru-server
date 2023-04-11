import { Module } from '@nestjs/common';
import { HashtagsService } from './hashtags.service';
import { HashtagsController } from './hashtags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hashtag } from 'src/entity/hashtag.entity';
import { HashtagRepository } from './hashtags.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Hashtag])],
    controllers: [HashtagsController],
    providers: [{
        provide: 'HashtagServiceInterface',
        useClass: HashtagsService,
    },
    {
        provide: 'HashtagRepositoryInterface',
        useClass: HashtagRepository,
    }],
})
export class HashtagsModule { }
