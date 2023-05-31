import { ConfigService } from "@nestjs/config";

export function getImageUrl(configService: ConfigService, imagePath: string): string {
    if(imagePath==null) return null;

    const s3Url = configService.get('AWS_S3_CLOUD_FRONT_URL');
    return `${s3Url}${imagePath}`;
}