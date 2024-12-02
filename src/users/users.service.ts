import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserRequest } from './dto/create-user.request';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { promises as fs } from 'fs';
import { join } from 'path';
import { USER_IMAGES } from './user-images';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(data: CreateUserRequest) {
    try {
      return await this.prismaService.user.create({
        data: {
          ...data,
          password: await bcrypt.hash(data.password, 10),
        },
        select: {
          email: true,
          id: true,
        },
      });
    } catch (err) {
      if (err.code === 'P2002') {
        throw new UnprocessableEntityException('Email already exists');
      }
      console.error(err);
      throw err;
    }
  }

  async getUser(filter: Prisma.UserWhereUniqueInput) {
    return this.prismaService.user.findUniqueOrThrow({
      where: filter,
    });
  }

  async getUsers() {
    const users = await this.prismaService.user.findMany();
    return Promise.all(
      users.map(async (user) => ({
        ...user,
        imageExists: await this.imageExists(user.id),
      })),
    );
  }

  async getUserById(userId: number) {
    try {
      return {
        ...(await this.prismaService.user.findUniqueOrThrow({
          where: { id: userId },
        })),
        imageExists: await this.imageExists(userId),
      };
    } catch (error) {
      throw new NotFoundException(`User not found with Id: ${userId}`);
    }
  }

  private async imageExists(userId: number) {
    try {
      await fs.access(join(`${USER_IMAGES}/${userId}.jpg`), fs.constants.F_OK);
      return true;
    } catch (error) {
      return false;
    }
  }
}
