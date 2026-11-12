
import {
  UnauthorizedException,
} from "@nestjs/common";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { PrismaService } from "../prisma/prisma.service.js";
import { BusinessesService } from "./businesses.service.js";

describe("BusinessesService", () => {
  const findMany = vi.fn();
  const findFirst = vi.fn();
  const create = vi.fn();
  const findUnique = vi.fn();

  const prisma = {
    business: {
      findMany,
      findFirst,
      create,
    },
    user: {
      findUnique,
    },
  } as unknown as PrismaService;

  const service = new BusinessesService(prisma);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("solo muestra establecimientos verificados al público", async () => {
    findMany.mockResolvedValue([]);

    await service.findAll();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          verified: true,
        },
      }),
    );
  });

  it("solo consulta establecimientos del propietario", async () => {
    findMany.mockResolvedValue([]);

    await service.findMine("usuario-1");

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          ownerId: "usuario-1",
        },
      }),
    );
  });

  it("registra establecimientos pendientes", async () => {
    findUnique.mockResolvedValue({
      id: "usuario-1",
    });

    create.mockResolvedValue({
      id: "establecimiento-1",
      name: "Panaderia ALIMENTA",
      verified: false,
    });

    await service.create("usuario-1", {
      name: "Panaderia ALIMENTA",
      address: "Calle 10 numero 20-30",
      city: "Medellín",
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          name: "Panaderia ALIMENTA",
          address: "Calle 10 numero 20-30",
          city: "Medellín",
          ownerId: "usuario-1",
          verified: false,
        },
      }),
    );
  });

  it("rechaza propietarios que no existen", async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      service.create("usuario-inexistente", {
        name: "Panaderia ALIMENTA",
        address: "Calle 10 numero 20-30",
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(create).not.toHaveBeenCalled();
  });

  it("no devuelve establecimientos pendientes en búsquedas públicas", async () => {
    findFirst.mockResolvedValue(null);

    await expect(
      service.findOne("establecimiento-1"),
    ).resolves.toBeNull();

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "establecimiento-1",
          verified: true,
        },
      }),
    );
  });
});
