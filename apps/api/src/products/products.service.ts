
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";
import { CreateProductDto } from "./dto/create-product.dto.js";
import { UpdateStockDto } from "./dto/update-stock.dto.js";

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

  async findMine(ownerId: string) {
    return this.prisma.product.findMany({
      where: {
        business: {
          ownerId,
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
        active: true,
        imagePath: true,
        createdAt: true,
        updatedAt: true,
        business: {
          select: {
            id: true,
            name: true,
            verified: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });
  }

  async updateStock(
    productId: string,
    ownerId: string,
    dto: UpdateStockDto,
  ) {
    const where = {
      id: productId,
      business: {
        ownerId,
        verified: true,
      },
    };

    const result = await this.prisma.product.updateMany({
      where,
      data: {
        quantity: dto.quantity,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(
        "Producto no encontrado o no autorizado.",
      );
    }

    return this.prisma.product.findFirst({
      where,
      select: {
        id: true,
        name: true,
        quantity: true,
        unit: true,
        active: true,
        updatedAt: true,
        businessId: true,
      },
    });
  }
}
