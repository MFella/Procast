import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SocialUserToLoginDto {
  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  idToken: string;
}
