
import {
  Controller,
  Get,
  ServiceUnavailableException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: "ok",
        application: "ALIMENTA",
        service: "api",
        database: "connected",
        version: "0.1.0",
      };
    } catch {
      throw new ServiceUnavailableException({
        status: "error",
        application: "ALIMENTA",
        service: "api",
        database: "disconnected",
      });
    }
  }
}
