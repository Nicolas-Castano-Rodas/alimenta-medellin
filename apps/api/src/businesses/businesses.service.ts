
import {
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";
import { CreateBusinessDto } from "./dto/create-business.dto.js";

@Injectable()
export class BusinessesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.business.findMany({
      where: {
        verified: true,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        verified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });
  }

  async findOne(id: string) {
    return this.prisma.business.findFirst({
      where: {
        id,
        verified: true,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        verified: true,
        createdAt: true,
      },
    });
  }

  async findMine(ownerId: string) {
    return this.prisma.business.findMany({
      where: {
        ownerId,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        verified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async create(ownerId: string, dto: CreateBusinessDto) {
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: { id: true },
    });

    if (!owner) {
      throw new UnauthorizedException(
        "Usuario no autorizado.",
      );
    }

    return this.prisma.business.create({
      data: {
        name: dto.name.trim(),
        address: dto.address.trim(),
        city: dto.city?.trim() || "Medellín",
        ownerId,
        verified: false,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        verified: true,
        createdAt: true,
      },
    });
  }
}
