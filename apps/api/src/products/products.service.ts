
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { Prisma } from "../generated/prisma/client.js";
import { FoodDateType } from "../generated/prisma/enums.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateProductDto } from "./dto/create-product.dto.js";
import { UpdateFoodSafetyDto } from "./dto/update-food-safety.dto.js";
import { UpdateProductPriceDto } from "./dto/update-product-price.dto.js";
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

  async updateFoodSafety(
    productId: string,
    ownerId: string,
    dto: UpdateFoodSafetyDto,
  ) {
    const where = {
      id: productId,
      business: {
        ownerId,
        verified: true,
      },
    };

    const existingProduct = await this.prisma.product.findFirst({
      where,
      select: {
        dateType: true,
        expirationDate: true,
      },
    });

    if (!existingProduct) {
      throw new NotFoundException(
        "Producto no encontrado o no autorizado.",
      );
    }

    const dateType = dto.dateType ?? existingProduct.dateType;

    const expirationDate =
      dto.expirationDate === undefined
        ? existingProduct.expirationDate
        : dto.expirationDate === null
          ? null
          : new Date(dto.expirationDate);

    if (
      expirationDate !== null &&
      Number.isNaN(expirationDate.getTime())
    ) {
      throw new BadRequestException(
        "La fecha proporcionada no es válida.",
      );
    }

    if (dateType === FoodDateType.NOT_APPLICABLE) {
      if (expirationDate !== null) {
        throw new BadRequestException(
          "Los productos sin fecha aplicable no pueden tener una fecha de vencimiento.",
        );
      }
    }

    if (
      dateType === FoodDateType.EXPIRATION ||
      dateType === FoodDateType.BEST_BEFORE
    ) {
      if (expirationDate === null) {
        throw new BadRequestException(
          "Este tipo de fecha requiere una fecha registrada.",
        );
      }
    }

    if (
      dateType === FoodDateType.EXPIRATION &&
      expirationDate !== null &&
      expirationDate.getTime() <= Date.now()
    ) {
      throw new BadRequestException(
        "No se puede registrar una fecha de vencimiento pasada o actual.",
      );
    }

    const result = await this.prisma.product.updateMany({
      where,
      data: {
        expirationDate,
        dateType,
        ...(dto.storageCondition !== undefined && {
          storageCondition: dto.storageCondition,
        }),
        ...(dto.batchNumber !== undefined && {
          batchNumber: dto.batchNumber,
        }),
        ...(dto.safetyNotes !== undefined && {
          safetyNotes: dto.safetyNotes,
        }),
        active: false,
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
        expirationDate: true,
        dateType: true,
        storageCondition: true,
        batchNumber: true,
        safetyNotes: true,
        active: true,
        updatedAt: true,
      },
    });
  }

  async updatePrice(
    productId: string,
    ownerId: string,
    dto: UpdateProductPriceDto,
  ) {
    if (
      !Number.isFinite(dto.price) ||
      !Number.isFinite(dto.originalPrice) ||
      dto.price <= 0 ||
      dto.originalPrice <= 0
    ) {
      throw new BadRequestException(
        "Los precios deben ser valores positivos.",
      );
    }

    const price = new Prisma.Decimal(dto.price);
    const originalPrice = new Prisma.Decimal(dto.originalPrice);

    if (price.greaterThan(originalPrice)) {
      throw new BadRequestException(
        "El precio de oferta no puede superar el precio original.",
      );
    }

    const where = {
      id: productId,
      business: {
        ownerId,
        verified: true,
      },
    };

    const updated = await this.prisma.product.updateMany({
      where,
      data: {
        price,
        originalPrice,
        active: false,
      },
    });

    if (updated.count === 0) {
      throw new NotFoundException(
        "Producto no encontrado o no autorizado.",
      );
    }

    const product = await this.prisma.product.findFirst({
      where,
      select: {
        id: true,
        name: true,
        price: true,
        originalPrice: true,
        quantity: true,
        active: true,
        updatedAt: true,
      },
    });

    if (!product) {
      throw new NotFoundException(
        "Producto no encontrado o no autorizado.",
      );
    }

    const discountPercentage = new Prisma.Decimal(100)
      .minus(
        product.price
          .div(product.originalPrice)
          .mul(100),
      )
      .toDecimalPlaces(2);

    return {
      ...product,
      discountPercentage: discountPercentage.toNumber(),
    };
  }
}
