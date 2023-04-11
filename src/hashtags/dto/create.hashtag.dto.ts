import { IsString } from "class-validator";

export class CreateHashTagsDto{
    @IsString({ each: true })
    contents: string[];
}