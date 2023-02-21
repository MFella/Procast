import {IsEmail, IsNotEmpty} from "class-validator";

export class EmailToCheckDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}