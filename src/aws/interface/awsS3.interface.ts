import { PromiseResult } from "aws-sdk/lib/request";


export interface CreatedS3ImageFiles{
    uploadedFiles: { 
        key: string; 
        s3Object: PromiseResult<AWS.S3.PutObjectOutput, AWS.AWSError>; 
        contentType: string 
    }[];
}