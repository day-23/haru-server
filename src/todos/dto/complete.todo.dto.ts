import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsOptional } from "class-validator"

export class NotRepeatTodoCompleteDto{
    @ApiProperty({ example: "true / false", description: '투두 완료 여부 boolean' })
    @IsNotEmpty()
    @IsBoolean()
    completed : boolean
}

export class RepeatSplitFrontDto{
    @ApiProperty({ description: '다음 마감일'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    endDate: Date;
}

export class RepeatSplitMiddleDto{
    @ApiProperty({ description: '완료된 날짜'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    completedDate: Date;
    
    @ApiProperty({ description: '다음 마감일'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    endDate: Date;
}

export class RepeatSplitBackDto{
    @ApiProperty({ description: '이전 마감일'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    repeatEnd: Date;
}
