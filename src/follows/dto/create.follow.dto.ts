import { IsString, IsUUID } from "class-validator";

export class CreateFollowDto{
    @IsString()
    followId : string
}