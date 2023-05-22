import { IsString, IsUUID } from "class-validator";

export class CreateFreindRequestDto {
    @IsString()
    acceptorId: string
}

export class acceptFreindRequestDto {
    @IsString()
    requestId: string
}

export class DeleteFollowDto{
    @IsString()
    followId : string
}

export class DeleteFollowingDto{
    @IsString()
    followingId : string
}