import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDefined, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, Validate, ValidateIf, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, } from 'class-validator';

// /* Custom validator to check if value is a string */
// @ValidatorConstraint({ name: 'isString', async: false })
// export class IsStringValidator implements ValidatorConstraintInterface {
//   validate(value: any, args: ValidationArguments) {

//     console.log('decorator DEBUG',typeof value, value)
//     return typeof value === 'string';
//   }

//   defaultMessage(args: ValidationArguments) {
//     return `${args.property} should be a string`;
//   }
// }

/* alarm 단일 생성 DTO */
export class CreateAlarmDto {
    @ApiProperty({ example: 'todoId', description: '알림을 생성하고자하는 todo의 Id' })
    @IsOptional()
    @IsString()
    todoId: string;

    @ApiProperty({ example: 'scheduleId', description: '알림을 생성하고자하는 schedule의 Id' })
    @IsOptional()
    @IsString()
    scheduleId: string;

    @ApiProperty({ example: "2023-03-09T18:30:00.123+09:00", description: 'alarm 단일 생성 DTO' })
    @Transform(({ value }) => new Date(value))
    time: Date;

}

/* alarm 여러개 생성 DTO */
export class CreateAlarmsDto {
    @ApiProperty({ example: 'todoId', description: '알림을 생성하고자하는 todo의 Id' })
    @IsOptional()
    @IsString()
    todoId?: string;

    @ApiProperty({ example: 'scheduleId', description: '알림을 생성하고자하는 schedule의 Id' })
    @IsOptional()
    @IsString()
    scheduleId?: string;

    /* 알람이기 때문에 Date는 필수값 */
    @ApiProperty({ example: '["2023-03-09T18:30:00.123+09:00", "2023-03-09T18:30:00.123+10:00", "2023-03-09T18:30:00.123+09:00"]', description: 'alarm 여러개 생성 DTO' })
    @Transform(({ value }) => {
        if (Array.isArray(value)) {
            return value.map(date => new Date(date));
        }
        return [new Date(value)];
    })
    @IsNotEmpty()
    times: Date[];
}

/* alarm 단일 업데이트 DTO */
export class UpdateAlarmDto { 
    @ApiProperty({ example: "2023-03-09T18:30:00.123+09:00", description: 'alarm update DTO' })
    @IsDefined()
    @IsNotEmpty()
    // @Validate(IsStringValidator)
    @Transform(({ value }) => {
        // console.log( 'transform', value)
        return new Date(value)})
    time: Date;
}

/* alarm delete DTO */
export class DeleteAlarmsDto {
    @ApiProperty({ example: "['alarmId1', 'alarmId2', 'alarmId3',]", description: 'alarm 삭제를 위한 tagId 리스트' })
    @IsString({ each: true })
    alarmIds: string[];
}
