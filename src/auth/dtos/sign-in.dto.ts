import { ApiProperty } from "@nestjs/swagger";
import { IsMobilePhone, IsNotEmpty, IsString } from "class-validator";

export class SignInDto {
    @IsNotEmpty()
    @IsMobilePhone()
    @ApiProperty({ example: 'nhatminh772002@gmail.com' })
    email: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: '123456' })
    password: string
}