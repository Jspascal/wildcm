import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EditUserDto } from "./dto/edit-user.dto";
import { throws } from "assert";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }
  async editUser(userId: number, dto: EditUserDto) {
    try {
      const user = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          ...dto,
        },
      });

      delete user.hash;

      return user;
    } catch (error) {
      throws(error);
    }
  }
}
