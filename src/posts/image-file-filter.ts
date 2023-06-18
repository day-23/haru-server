import { HttpException, HttpStatus } from '@nestjs/common';

export const imageFileFilter = (req: any, file: any, callback: (error: Error | null, acceptFile: boolean) => void) => {
    
    console.log('debug', file.mimetype, file)
    
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/jpg',
        'image/webp',
        'image/bmp',
        'image/heic',
        'image/heif',
        'image/*'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        const error = new HttpException(`Failed to upload file. The file mimetype must be one of the following: jpeg, png, gif, jpg, webp, bmp, heic, heif`, HttpStatus.BAD_REQUEST);
        callback(error, false);
    }
};
