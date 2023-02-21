import * as argon2 from "argon2";
import {BadRequestException, Injectable, UnauthorizedException} from "@nestjs/common";
import {PrismaService} from "../../prisma/prisma.service";
import {Prisma} from '@prisma/client';
import {UserToCreateDto} from "../dtos/user/userToCreate.dto";
import {UserToLoginDto} from "../dtos/user/userToLogin.dto";
import {JwtService} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";

type JwtPayload = {
    email: string;
};

export type JwtToken = {
  expiresIn: string;
  accessToken: string;
};

@Injectable()
export class AuthService {

    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    async registerUser(userToCreateDto: UserToCreateDto): Promise<true> {
        const userFromDb = await this.prismaService.user.findUnique({ where: {email: userToCreateDto.email }});

        if (userFromDb) {
            throw new BadRequestException('User with that email already exists');
        }

        const isPasswordEquals: boolean = userToCreateDto.password === userToCreateDto.repeatPassword;

        if (!isPasswordEquals) {
            throw new BadRequestException('Passwords dont match');
        }


        const prismaUserToCreate: Prisma.UserCreateInput = await this.convertUserToCreateDtoToPrismaUser(userToCreateDto);
        await this.prismaService.user.create({ data: prismaUserToCreate });

        return true;
    }

    async loginUser(userToLoginDto: UserToLoginDto): Promise<JwtToken> {
        if (!await this.validateUser(userToLoginDto)) {
            throw new UnauthorizedException('Credentials dont match');
        }

        const payload: JwtPayload = { email: userToLoginDto.email };

        const expiresIn: string = this.configService.get('jwtExpirationTime') as string;

        return { expiresIn, accessToken: this.jwtService.sign(payload) }
    }

    async isEmailValid(email: string): Promise<boolean> {
        const userFromDb = await this.prismaService.user.findFirst({ where: { email }});
        return !!userFromDb;
    }

    private async convertUserToCreateDtoToPrismaUser(userToCreateDto: UserToCreateDto): Promise<Prisma.UserCreateInput> {
        const passwordHash: string = await argon2.hash(userToCreateDto.password);
        const { password, repeatPassword, name, surname, ...rest } = userToCreateDto;

        return { passwordHash, name: name ?? '', surname: surname ?? '',  ...rest };
    }

    private async validateUser(userToLoginDto: UserToLoginDto): Promise<boolean> {
        const userFromDb = await this.prismaService.user.findFirst({ where: { email: userToLoginDto.email } });

        if (!userFromDb) {
            throw new BadRequestException('Email doesnt exist. Register first');
        }

        return await argon2.verify(userFromDb.passwordHash, userToLoginDto.password);
    }
}