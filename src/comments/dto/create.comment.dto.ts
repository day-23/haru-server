import { BadRequestException } from "@nestjs/common";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsDefined, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateCommentDto{
    @ApiProperty({ description: 'Comment 내용' })
    @MinLength(1)
    @MaxLength(200)
    @IsString()
    content: string;
}

export class CreateImageCommentDto extends CreateCommentDto{
    @ApiProperty({ description: '댓글 x좌표' })
    @IsNumber()
    x: number;

    @ApiProperty({ description: '댓글 y좌표' })
    @IsNumber()
    y: number;

    @IsBoolean()
    @IsOptional()
    isPublic: boolean;
}

export class UpdateCommentDto extends PartialType(CreateImageCommentDto) {}


export class UpdateCommentsByWriterDto {
    @ApiProperty({ description: '댓글 id들' })
    @IsString({ each: true })
    commentIds: string[]

    @ApiProperty({ description: '댓글 x좌표' })
    @IsNumber({}, { each: true })
    x: number[];

    @ApiProperty({ description: '댓글 y좌표' })
    @IsNumber({}, { each: true })
    y: number[];
}