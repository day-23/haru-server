import { Type } from 'class-transformer';
import { IsInt, IsNumber, Min } from 'class-validator';

export class PaginationDto {
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page: number = 1;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit: number = 10;
}
