
import {
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";
import { CreateProductDto } from "./dto/create-product.dto.js";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    ownerId: string,
    dto: CreateProductDto,
  ) {
    const business = await this.prisma.business.findFirst({
      where: {
        id: dto.businessId,
        ownerId,
        verified: true,
      },
      select: {
        id: true,
      },
    });

    if (!business) {
      throw new ForbiddenException(
        "No tienes un establecimiento aprobado y autorizado para registrar este producto.",
      );
    }

    if (dto.price > dto.originalPrice) {
      throw new ForbiddenException(
        "El precio de oferta no puede superar el precio original.",
      );
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        price: dto.price,
        originalPrice: dto.originalPrice,
        quantity: dto.quantity,
        unit: dto.unit,
        businessId: business.id,
        active: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        originalPrice: true,
        quantity: true,
        unit: true,
        active: true,
        businessId: true,
        createdAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      where: {
        active: true,
        quantity: {
          gt: 0,
        },
        business: {
          verified: true,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        originalPrice: true,
        quantity: true,
        unit: true,
        imagePath: true,
        business: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
      take: 50,
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
