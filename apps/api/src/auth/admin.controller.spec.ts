
import { NotFoundException } from "@nestjs/common";
import type { Request } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "../prisma/prisma.service.js";
import { AdminController } from "./admin.controller.js";

describe("AdminController", () => {
  const findMany = vi.fn();
  const updateMany = vi.fn();
  const findUnique = vi.fn();

  const prisma = {
    business: {
      findMany,
      updateMany,
      findUnique,
    },
  } as unknown as PrismaService;

  const controller = new AdminController(prisma);

  const businessId = "5e6f8314-94ca-42fb-91da-149be2c544a1";

  function adminRequest(id: string) {
    return {
      user: {
        id,
        role: "ADMIN",
      },
    } as Request & {
      user: { id: string; role: string };
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("consulta únicamente solicitudes pendientes", async () => {
    findMany.mockResolvedValue([]);

    await controller.findPendingBusinesses();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          verified: false,
        },
        take: 50,
      }),
    );
  });

  it("aprueba una solicitud pendiente de otro propietario", async () => {
    updateMany.mockResolvedValue({ count: 1 });

    findUnique.mockResolvedValue({
      id: businessId,
      name: "Panaderia ALIMENTA",
      verified: true,
    });

    const result = await controller.verifyBusiness(
      businessId,
      adminRequest("administrador-1"),
    );

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: businessId,
        verified: false,
        ownerId: {
          not: "administrador-1",
        },
      },
      data: {
        verified: true,
      },
    });

    expect(result.business).toMatchObject({
      verified: true,
    });
  });

  it("rechaza solicitudes que no están pendientes", async () => {
    updateMany.mockResolvedValue({ count: 0 });

    await expect(
      controller.verifyBusiness(
        businessId,
        adminRequest("administrador-1"),
      ),
    ).rejects.toThrow(NotFoundException);

    expect(findUnique).not.toHaveBeenCalled();
  });

  it("exige que el propietario sea distinto del administrador", async () => {
    updateMany.mockResolvedValue({ count: 0 });

    await expect(
      controller.verifyBusiness(
        businessId,
        adminRequest("propietario-1"),
      ),
    ).rejects.toThrow(NotFoundException);

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          ownerId: {
            not: "propietario-1",
          },
        }),
      }),
    );
  });
});
