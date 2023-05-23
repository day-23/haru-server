import { IsString, IsUUID } from "class-validator";

export class CreateFreindRequestDto {
    @IsString()
    acceptorId: string
}

export class acceptFreindRequestDto {
    @IsString()
    requesterId: string
}

export class DeleteFriendDto{
    @IsString()
    friendId : string
}