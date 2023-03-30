import { Injectable } from "@nestjs/common";

@Injectable({})
export class AuthService {
    signup() {
        return {
            msg: 'Proceding sign up process..'
        };
    }

    signin() {
        return {
            msg: 'Proceding sign in process..'
        };
    }
}