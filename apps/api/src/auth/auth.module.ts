
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { AdminController } from "./admin.controller.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { JwtAuthGuard } from "./jwt-auth.guard.js";
import { RolesGuard } from "./roles.guard.js";

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.getOrThrow<string>("JWT_SECRET");

        if (secret.length < 32) {
          throw new Error(
            "JWT_SECRET debe tener al menos 32 caracteres.",
          );
        }

        return {
          secret,
          signOptions: {
            expiresIn: 900,
            algorithm: "HS256" as const,
          },
        };
      },
    }),
  ],
  controllers: [AuthController, AdminController],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  exports: [AuthService],
})
export class AuthModule {}
