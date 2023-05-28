import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsOptional } from "class-validator"
import { UpdateTodoDto } from "./create.todo.dto";

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
    endDate: Date;
}

export class DeleteRepeatSplitMiddleDto{
    @ApiProperty({ description: '완료된 날짜'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    removedDate: Date;
    
    @ApiProperty({ description: '다음 마감일'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    endDate: Date;
}

export class UpdateRepeatFrontTodoBySplitDto extends UpdateTodoDto{
    @ApiProperty({ description: '다음 마감일'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    nextEndDate: Date;
}

export class UpdateRepeatMiddleTodoBySplitDto extends UpdateTodoDto{
    @ApiProperty({ description: '완료된 날짜'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    changedDate: Date;
    
    @ApiProperty({ description: '다음 마감일'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    nextEndDate: Date;
}


export class UpdateRepeatBackTodoBySplitDto extends UpdateTodoDto{
    @ApiProperty({ description: '이전 마감일'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    preRepeatEnd: Date;
}


export class UpdateRepeatByDivide extends UpdateTodoDto{
    @ApiProperty({ description: '이전 마감일'})
    @IsDate()
    @Transform(({ value }) => new Date(value))
    preRepeatEnd: Date;
}