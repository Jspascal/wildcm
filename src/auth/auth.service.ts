import { ForbiddenException, Injectable } from "@nestjs/common";
import { User, Bookmark} from '@prisma/client';
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import* as argon from "argon2"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}
    async signup(dto: AuthDto) {

        const hash = await argon.hash(dto.password);

        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash
                }
            });
            delete user.hash;
            return {
                msg: 'user signed up',
                data: user
            };
        } catch (error) {
            if(error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException(
                      'An account with this email already exist',
                    );
                }
            }
            throw error;
        }
    }

    signin() {
        return {
            msg: 'Proceding sign in process..'
        };
    }
}