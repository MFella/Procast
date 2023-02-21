import {Body, Controller, Get, Post, Query} from "@nestjs/common";
import {UserToCreateDto} from "../dtos/user/userToCreate.dto";
import {AuthService, JwtToken} from "./auth.service";
import {UserToLoginDto} from "../dtos/user/userToLogin.dto";
import {EmailToCheckDto} from "../dtos/user/emailToCheck.dto";

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {
    }

    @Post('register')
    async createUser(@Body() userToCreateDto: UserToCreateDto): Promise<true> {
        return await this.authService.registerUser(userToCreateDto);
    }

    @Post('login')
    async loginUser(@Body() userToLoginDto: UserToLoginDto): Promise<JwtToken> {
        return this.authService.loginUser(userToLoginDto);
    }

    @Get('check-email')
    async isEmailExists(@Query() emailToCheckDto: EmailToCheckDto): Promise<boolean> {
        return this.authService.isEmailValid(emailToCheckDto.email);
    }
}