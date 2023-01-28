import {IsEmail, IsNotEmpty, Matches} from "class-validator";

export class UserToLoginDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @Matches('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$')
    @IsNotEmpty()
    password: string;
}