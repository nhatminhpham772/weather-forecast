import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsMobilePhone, IsDate, Length, MinLength, MaxLength, Matches, IsEmail, IsEnum, IsPhoneNumber } from "class-validator";

export class SignUpDto {
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({ example: 'customer@gmail.com' })
    email: string

    @IsNotEmpty()
    @IsString()
    @Length(8, 30)
    @ApiProperty({ example: '12345678' })
    password: string

    @IsString()
    @Length(8, 30)
    @ApiProperty({ example: '12345678' })
    passwordConfirm: string;
}