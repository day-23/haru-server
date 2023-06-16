import * as path from 'path';
import * as AWS from 'aws-sdk';
import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PromiseResult } from 'aws-sdk/lib/request';
import { CreatedS3ImageFile, CreatedS3ImageFiles } from './interface/awsS3.interface';

// sharp

@Injectable()
export class AwsService {
    private readonly awsS3: AWS.S3;
    public readonly S3_BUCKET_NAME: string;

    constructor(private readonly configService: ConfigService) {
        this.awsS3 = new AWS.S3({
            accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'), // process.env.AWS_S3_ACCESS_KEY
            secretAccessKey: this.configService.get('AWS_S3_SECRET_KEY'),
            region: this.configService.get('AWS_S3_REGION'),
        });
        this.S3_BUCKET_NAME = this.configService.get('AWS_S3_BUCKET_NAME'); // nest-s3
    }

    async uploadFileToS3(folder: string, file: Express.Multer.File,): Promise<CreatedS3ImageFile> {
        try {
            const originalName = file.originalname
            const key = `${folder}/${Date.now()}_${path.basename(file.originalname,)}`.replace(/ /g, '');

            const s3Object = await this.awsS3
                .putObject({
                    Bucket: this.S3_BUCKET_NAME,
                    Key: key,
                    Body: file.buffer,
                    ACL: 'public-read',
                    ContentType: file.mimetype,
                })
                .promise();

            const uploadedFile =  { originalName, key, s3Object, contentType: file.mimetype, size: file.size};
            return { uploadedFile }
        } catch (error) {
            throw new HttpException(`Failed to upload file : ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async uploadFilesToS3(folder: string, files: Express.Multer.File[]): Promise<CreatedS3ImageFiles> {
        try {
            const uploadPromises = files.map((file) => {
                const originalName = file.originalname
                const key = `${folder}/${Date.now()}_${path.basename(file.originalname,)}`.replace(/ /g, '');
    
                return this.awsS3
                    .putObject({
                        Bucket: this.S3_BUCKET_NAME,
                        Key: key,
                        Body: file.buffer,
                        ACL: 'public-read',
                        ContentType: file.mimetype,
                    })
                    .promise()
                    .then((s3Object) => ({
                        originalName,
                        key,
                        s3Object,
                        contentType: file.mimetype,
                        size: file.size,
                    }));
            });

            const uploadedFiles = await Promise.all(uploadPromises);
            return { uploadedFiles };
        } catch (error) {
            throw new HttpException(`Failed to upload file : ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async deleteS3Object(
        key: string,
        callback?: (err: AWS.AWSError, data: AWS.S3.DeleteObjectOutput) => void,
    ): Promise<{ success: true }> {
        try {
            await this.awsS3
                .deleteObject(
                    {
                        Bucket: this.S3_BUCKET_NAME,
                        Key: key,
                    },
                    callback,
                )
                .promise();
            return { success: true };
        } catch (error) {
            throw new HttpException(`Failed to delete file : ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public getAwsS3FileUrl(objectKey: string) {
        return `https://${this.S3_BUCKET_NAME}.s3.amazonaws.com/${objectKey}`;
    }
}