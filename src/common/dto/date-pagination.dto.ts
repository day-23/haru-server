import { Transform, Type } from 'class-transformer';
import { IsDate, IsInt, IsNumber, IsString, Min } from 'class-validator';

export class DatePaginationDto {
    @IsString()
    startDate: string = `${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}01`;

    @IsString()
    endDate: string = `${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}`;
}

export class DateTimePaginationDto{
    @Transform(({ value }) => value ? new Date(value) : null)
    @IsDate()
    startDate: Date

    @Transform(({ value }) => value ? new Date(value) : null)
    @IsDate()
    endDate: Date
}

export class TodayTodoDto{
    @Transform(({ value }) => value ? new Date(value) : null)
    @IsDate()
    endDate: Date
}