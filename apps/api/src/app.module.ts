
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { BusinessesModule } from "./businesses/businesses.module.js";
import { HealthController } from "./health/health.controller.js";
import { PrismaModule } from "./prisma/prisma.module.js";

@Module({
  imports: [PrismaModule, BusinessesModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
