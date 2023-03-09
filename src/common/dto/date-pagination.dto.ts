import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsString, Min } from 'class-validator';

export class DatePaginationDto {
    @IsString()
    startDate: string = `${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}01`;

    @IsString()
    endDate: string = `${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}`;
}
