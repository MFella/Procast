import {IsEmail, IsNotEmpty, IsOptional, IsString, Matches} from "class-validator";

export class UserToCreateDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    surname?: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @Matches('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$')
    @IsNotEmpty()
    password: string;

    @Matches('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$')
    @IsNotEmpty()
    repeatPassword: string;
}