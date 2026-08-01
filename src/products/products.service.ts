import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductRequest } from './dto/create-product.request';
import { PrismaService } from '../prisma/prisma.service';
import { promises as fs } from 'fs';
import { join } from 'path';
import { PRODUCT_IMAGES } from './product-images';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}
  async createProduct(data: CreateProductRequest, userId: number) {
    console.log('Inside createProduct');

    return this.prismaService.product.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async getAllProducts() {
    const products = this.prismaService.product.findMany();
    return Promise.all(
      (await products).map(async (product) => ({
        ...product,
        imageExists: await this.imageExists(product.id),
      })),
    );
  }

  async getProduct(productId: number) {
    try {
      const product = await this.prismaService.product.findUniqueOrThrow({
        where: {
          id: productId,
        },
      });
      return {
        ...product,
        imageExists: await this.imageExists(product.id),
      };
    } catch (error) {
      throw new NotFoundException(`Product with ID ${productId} was not found`);
    }
  }

  private async imageExists(productId: number) {
    try {
      // await fs.access(`public/products/${productId}.jpg`);
      await fs.access(
        join(`${PRODUCT_IMAGES}/${productId}.jpeg`),
        fs.constants.F_OK,
      );

      return true;
    } catch (error) {
      return false;
    }
  }
}
