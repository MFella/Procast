import {Body, Controller, Post} from "@nestjs/common";
import {UserToCreateDto} from "../dtos/user/userToCreate.dto";
import {AuthService, JwtToken} from "./auth.service";
import {UserToLoginDto} from "../dtos/user/userToLogin.dto";

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
}