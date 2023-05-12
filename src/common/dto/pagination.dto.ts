import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, Min } from 'class-validator';

export class PaginationDto {
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page: number = 1;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit: number = 20;
}


export class PostPaginationDto extends PaginationDto {
    @IsDateString()
    lastCreatedAt: string = "2222-08-26T00:00:00.000Z";
}

export function createPaginationObject(count: number, limit: number, page: number) {
    const totalPages = Math.ceil(count / limit);
    return {
        totalItems: count,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: totalPages,
    };
}