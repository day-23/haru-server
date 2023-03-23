import { PromiseResult } from "aws-sdk/lib/request";


export interface CreatedS3ImageFile{
    uploadedFile: { 
        originalName : string,
        key: string; 
        s3Object: PromiseResult<AWS.S3.PutObjectOutput, AWS.AWSError>; 
        contentType: string 
        size : number
    };
}

export interface CreatedS3ImageFiles{
    uploadedFiles: { 
        originalName : string,
        key: string; 
        s3Object: PromiseResult<AWS.S3.PutObjectOutput, AWS.AWSError>; 
        contentType: string 
        size : number
    }[];
}