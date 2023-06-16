import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsString, Min } from 'class-validator';

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


export class SearchPaginationDto extends PostPaginationDto {
    @IsString()
    name: string = "";
}


export function createPaginationObject(count: number, limit: number, page: number) {
    const totalPages = Math.max(1, Math.ceil(count / limit)) 
    return {
        totalItems: count,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: totalPages,
    };
}