import { IsString, IsUUID } from "class-validator";

export class CreateFollowDto{
    @IsString()
    followId : string
}

export class DeleteFollowDto{
    @IsString()
    followId : string
}

export class DeleteFollowingDto{
    @IsString()
    followingId : string
}