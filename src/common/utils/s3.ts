import { ConfigService } from "@nestjs/config";

export function getS3ImageUrl(configService: ConfigService, imagePath: string): string {
    const s3Url = configService.get('AWS_S3_URL');
    return `${s3Url}${imagePath}`;
}