import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    isString,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

/**
 * @description SRP를 위반하는 구조이지만 테스트용으로 한 파일에 두 클래스를 선언했다.
 *
 * SRP란: 한 클래스는 하나의 책임만 가져야한다. (단일 책임의 원칙)
 */
export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    email: string; // 유저 아이디

    @IsString()
    // @IsNotEmpty()
    @IsOptional() // 필수 값이 아니라 선택 값으로
    @MinLength(8)
    @MaxLength(16)
    // 최소 8자 및 최대 16자, 하나 이상의 대문자, 하나의 소문자, 하나의 숫자 및 하나의 특수 문자
    // @Matches(
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/,
    //   {
    //     message: '비밀번호 양식에 맞게 작성하세요.',
    //   },
    // )
    password: string; //유저 비밀번호

    @IsString()
    @IsNotEmpty()
    socialAccountType: string; // 유저 소셜 계정 타입

    @IsString()
    @IsNotEmpty()
    name: string; // 유저 이름

    @IsString()
    @IsOptional()
    phone: string;
}

export class UpdateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string; // 유저 이름
}

export class UpdateUserSignUpDto {
    @IsBoolean()
    isSignUp : boolean; // 유저 이름
}

export class UpdateUserOptionDto {
    @IsOptional()
    @IsBoolean()
    isPublicAccount: boolean;

    @IsOptional()
    @IsString()
    haruId: string;

    @IsOptional()
    @IsString()
    socialAccountType: string;

    @IsOptional()
    @IsBoolean()
    isPostBrowsingEnabled: boolean;

    @IsOptional()
    @IsNumber()
    isAllowFeedLike: number;

    @IsOptional()
    @IsNumber()
    isAllowFeedComment: number;

    @IsOptional()
    @IsBoolean()
    isAllowSearch: boolean;

    @IsOptional()
    @Transform(({ value }) => value ? new Date(value) : null)
    @IsDate()
    morningAlarmTime : Date;

    @IsOptional()
    @Transform(({ value }) => value ? new Date(value) : null)
    @IsDate()
    nightAlarmTime : Date;

    @IsOptional()
    @IsBoolean()
    isScheduleAlarmOn : boolean;
}

export class UpdateUserOptionPartialDto extends PartialType(UpdateUserOptionDto) { }