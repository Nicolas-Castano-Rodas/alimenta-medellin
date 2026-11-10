
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class BusinessesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.business.findMany({
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
    return this.prisma.business.findUnique({
      where: { id },
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
