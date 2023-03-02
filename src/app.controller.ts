import { Controller, Get, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { AwsService } from './aws/aws.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService, private readonly awsService: AwsService) { }

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('image'))
    async uploadMediaFile(@UploadedFile() file: Express.Multer.File) {
        console.log(file)
        return this.awsService.uploadFileToS3('sns', file)
    }
 
}
