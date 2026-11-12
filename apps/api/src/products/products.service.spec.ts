
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { Prisma } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { ProductsService } from "./products.service.js";

describe("ProductsService", () => {
  const findFirst = vi.fn();
  const findMany = vi.fn();
  const create = vi.fn();
  const updateMany = vi.fn();
  const findProduct = vi.fn();

  const prisma = {
    business: {
      findFirst,
    },
    product: {
      create,
      findMany,
      updateMany,
      findFirst: findProduct,
    },
  } as unknown as PrismaService;

  const service = new ProductsService(prisma);

  const productDto = {
    name: "Combo de Pan Artesanal",
    description: "Paquete de panes del dia",
    category: "Panaderia",
    price: 8500,
    originalPrice: 15000,
    quantity: 10,
    unit: "paquete",
    businessId: "establecimiento-1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("permite registrar productos de un establecimiento propio y aprobado", async () => {
    findFirst.mockResolvedValue({
      id: "establecimiento-1",
    });

    create.mockResolvedValue({
      id: "producto-1",
      ...productDto,
      active: false,
    });

    const result = await service.create(
      "propietario-1",
      productDto,
    );

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: "establecimiento-1",
        ownerId: "propietario-1",
        verified: true,
      },
      select: {
        id: true,
      },
    });

    expect(result.active).toBe(false);
  });

  it("crea los productos inicialmente inactivos", async () => {
    findFirst.mockResolvedValue({
      id: "establecimiento-1",
    });

    create.mockResolvedValue({
      id: "producto-1",
      active: false,
    });

    await service.create("propietario-1", productDto);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          active: false,
          quantity: 10,
          businessId: "establecimiento-1",
        }),
      }),
    );
  });

  it("impide crear productos en establecimientos ajenos o no aprobados", async () => {
    findFirst.mockResolvedValue(null);

    await expect(
      service.create("otro-usuario", productDto),
    ).rejects.toThrow(ForbiddenException);

    expect(create).not.toHaveBeenCalled();
  });

  it("rechaza precios de oferta superiores al precio original", async () => {
    findFirst.mockResolvedValue({
      id: "establecimiento-1",
    });

    await expect(
      service.create("propietario-1", {
        ...productDto,
        price: 20000,
        originalPrice: 15000,
      }),
    ).rejects.toThrow(ForbiddenException);

    expect(create).not.toHaveBeenCalled();
  });

  it("solo muestra productos activos, disponibles y de negocios aprobados", async () => {
    findMany.mockResolvedValue([]);

    await service.findAll();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          active: true,
          quantity: {
            gt: 0,
          },
          business: {
            verified: true,
          },
        },
        take: 50,
      }),
    );
  });

  it("consulta únicamente productos de establecimientos propios", async () => {
    findMany.mockResolvedValue([]);

    await service.findMine("propietario-1");

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          business: {
            ownerId: "propietario-1",
          },
        },
      }),
    );
  });

  it("permite consultar productos inactivos del propietario", async () => {
    findMany.mockResolvedValue([
      {
        id: "producto-1",
        name: "Combo de Pan Artesanal",
        active: false,
        quantity: 10,
      },
    ]);

    const products = await service.findMine("propietario-1");

    expect(products).toHaveLength(1);
    expect(products[0].active).toBe(false);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          business: {
            ownerId: "propietario-1",
          },
        },
      }),
    );
  });

  it("actualiza el inventario de un producto propio", async () => {
    updateMany.mockResolvedValue({ count: 1 });

    findProduct.mockResolvedValue({
      id: "producto-1",
      name: "Combo de Pan Artesanal",
      quantity: 8,
      active: false,
    });

    const result = await service.updateStock(
      "producto-1",
      "propietario-1",
      { quantity: 8 },
    );

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: "producto-1",
        business: {
          ownerId: "propietario-1",
          verified: true,
        },
      },
      data: {
        quantity: 8,
      },
    });

    expect(result).toMatchObject({
      quantity: 8,
      active: false,
    });
  });

  it("impide actualizar productos ajenos o de establecimientos no verificados", async () => {
    updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.updateStock(
        "producto-ajeno",
        "otro-usuario",
        { quantity: 20 },
      ),
    ).rejects.toThrow(
      "Producto no encontrado o no autorizado.",
    );

    expect(findProduct).not.toHaveBeenCalled();
  });

  it("permite establecer el inventario en cero", async () => {
    updateMany.mockResolvedValue({ count: 1 });

    findProduct.mockResolvedValue({
      id: "producto-1",
      quantity: 0,
      active: false,
    });

    const result = await service.updateStock(
      "producto-1",
      "propietario-1",
      { quantity: 0 },
    );

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          quantity: 0,
        },
      }),
    );

    expect(result).toMatchObject({
      quantity: 0,
    });
  });

  it("no modifica el estado de publicación al actualizar existencias", async () => {
    updateMany.mockResolvedValue({ count: 1 });

    findProduct.mockResolvedValue({
      id: "producto-1",
      quantity: 5,
      active: false,
    });

    await service.updateStock(
      "producto-1",
      "propietario-1",
      { quantity: 5 },
    );

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          quantity: 5,
        },
      }),
    );

    const updateArguments = updateMany.mock.calls[0][0] as {
      data: Record<string, unknown>;
    };

    expect(updateArguments.data).not.toHaveProperty("active");
  });

  it("permite registrar una fecha de vencimiento futura", async () => {
    findProduct.mockResolvedValueOnce({
      dateType: null,
      expirationDate: null,
    });

    updateMany.mockResolvedValue({ count: 1 });

    findProduct.mockResolvedValueOnce({
      id: "producto-1",
      dateType: "EXPIRATION",
      expirationDate: new Date("2099-12-31T23:59:59Z"),
      active: false,
    });

    const result = await service.updateFoodSafety(
      "producto-1",
      "propietario-1",
      {
        dateType: "EXPIRATION",
        expirationDate: "2099-12-31T23:59:59Z",
      },
    );

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: "producto-1",
        business: {
          ownerId: "propietario-1",
          verified: true,
        },
      },
      data: {
        expirationDate: new Date("2099-12-31T23:59:59Z"),
        dateType: "EXPIRATION",
        active: false,
      },
    });

    expect(result).toMatchObject({
      dateType: "EXPIRATION",
      active: false,
    });
  });

  it("rechaza fechas de vencimiento pasadas", async () => {
    findProduct.mockResolvedValue({
      dateType: null,
      expirationDate: null,
    });

    await expect(
      service.updateFoodSafety(
        "producto-1",
        "propietario-1",
        {
          dateType: "EXPIRATION",
          expirationDate: "2020-01-01T00:00:00Z",
        },
      ),
    ).rejects.toThrow(BadRequestException);

    expect(updateMany).not.toHaveBeenCalled();
  });

  it("rechaza fechas faltantes para tipos que requieren fecha", async () => {
    findProduct.mockResolvedValue({
      dateType: null,
      expirationDate: null,
    });

    await expect(
      service.updateFoodSafety(
        "producto-1",
        "propietario-1",
        {
          dateType: "BEST_BEFORE",
        },
      ),
    ).rejects.toThrow(BadRequestException);

    expect(updateMany).not.toHaveBeenCalled();
  });

  it("rechaza NOT_APPLICABLE cuando existe una fecha", async () => {
    findProduct.mockResolvedValue({
      dateType: "EXPIRATION",
      expirationDate: new Date("2099-12-31T23:59:59Z"),
    });

    await expect(
      service.updateFoodSafety(
        "producto-1",
        "propietario-1",
        {
          dateType: "NOT_APPLICABLE",
        },
      ),
    ).rejects.toThrow(BadRequestException);

    expect(updateMany).not.toHaveBeenCalled();
  });

  it("permite retirar la fecha cuando deja de aplicar", async () => {
    findProduct.mockResolvedValueOnce({
      dateType: "EXPIRATION",
      expirationDate: new Date("2099-12-31T23:59:59Z"),
    });

    updateMany.mockResolvedValue({ count: 1 });

    findProduct.mockResolvedValueOnce({
      id: "producto-1",
      dateType: "NOT_APPLICABLE",
      expirationDate: null,
      active: false,
    });

    const result = await service.updateFoodSafety(
      "producto-1",
      "propietario-1",
      {
        dateType: "NOT_APPLICABLE",
        expirationDate: null,
      },
    );

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          dateType: "NOT_APPLICABLE",
          expirationDate: null,
          active: false,
        }),
      }),
    );

    expect(result).toMatchObject({
      dateType: "NOT_APPLICABLE",
      expirationDate: null,
      active: false,
    });
  });

  it("impide modificar datos sanitarios de productos ajenos", async () => {
    findProduct.mockResolvedValue(null);

    await expect(
      service.updateFoodSafety(
        "producto-ajeno",
        "otro-usuario",
        {
          batchNumber: "LOTE-NO-AUTORIZADO",
        },
      ),
    ).rejects.toThrow(NotFoundException);

    expect(findProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "producto-ajeno",
          business: {
            ownerId: "otro-usuario",
            verified: true,
          },
        },
      }),
    );

    expect(updateMany).not.toHaveBeenCalled();
  });

  it("conserva la fecha existente cuando solo se actualiza el lote", async () => {
    const existingDate = new Date("2099-12-31T23:59:59Z");

    findProduct.mockResolvedValueOnce({
      dateType: "EXPIRATION",
      expirationDate: existingDate,
    });

    updateMany.mockResolvedValue({ count: 1 });

    findProduct.mockResolvedValueOnce({
      id: "producto-1",
      dateType: "EXPIRATION",
      expirationDate: existingDate,
      batchNumber: "LOTE-NUEVO",
      active: false,
    });

    const result = await service.updateFoodSafety(
      "producto-1",
      "propietario-1",
      {
        batchNumber: "LOTE-NUEVO",
      },
    );

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          dateType: "EXPIRATION",
          expirationDate: existingDate,
          batchNumber: "LOTE-NUEVO",
          active: false,
        }),
      }),
    );

    expect(result).toMatchObject({
      batchNumber: "LOTE-NUEVO",
      dateType: "EXPIRATION",
      active: false,
    });
  });

  it("permite registrar BEST_BEFORE con una fecha pasada sin publicar el producto", async () => {
    const date = new Date("2020-01-01T00:00:00Z");

    findProduct.mockResolvedValueOnce({
      dateType: null,
      expirationDate: null,
    });

    updateMany.mockResolvedValue({ count: 1 });

    findProduct.mockResolvedValueOnce({
      id: "producto-1",
      dateType: "BEST_BEFORE",
      expirationDate: date,
      active: false,
    });

    const result = await service.updateFoodSafety(
      "producto-1",
      "propietario-1",
      {
        dateType: "BEST_BEFORE",
        expirationDate: date.toISOString(),
      },
    );

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          dateType: "BEST_BEFORE",
          expirationDate: date,
          active: false,
        }),
      }),
    );

    expect(result).toMatchObject({
      dateType: "BEST_BEFORE",
      active: false,
    });
  });

  it("rechaza una actualización si el producto deja de estar autorizado", async () => {
    findProduct.mockResolvedValueOnce({
      dateType: "EXPIRATION",
      expirationDate: new Date("2099-12-31T23:59:59Z"),
    });

    updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.updateFoodSafety(
        "producto-1",
        "propietario-1",
        {
          batchNumber: "LOTE-002",
        },
      ),
    ).rejects.toThrow(NotFoundException);

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "producto-1",
          business: {
            ownerId: "propietario-1",
            verified: true,
          },
        },
      }),
    );
  });

  it("actualiza los precios de un producto propio", async () => {
    updateMany.mockResolvedValue({ count: 1 });

    findProduct.mockResolvedValue({
      id: "producto-1",
      name: "Combo de Pan Artesanal",
      price: new Prisma.Decimal("7500"),
      originalPrice: new Prisma.Decimal("15000"),
      quantity: 8,
      active: false,
    });

    const result = await service.updatePrice(
      "producto-1",
      "propietario-1",
      {
        price: 7500,
        originalPrice: 15000,
      },
    );

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: "producto-1",
        business: {
          ownerId: "propietario-1",
          verified: true,
        },
      },
      data: {
        price: new Prisma.Decimal("7500"),
        originalPrice: new Prisma.Decimal("15000"),
        active: false,
      },
    });

    expect(result.discountPercentage).toBe(50);
    expect(result.active).toBe(false);
  });

  it("calcula correctamente descuentos con decimales", async () => {
    updateMany.mockResolvedValue({ count: 1 });

    findProduct.mockResolvedValue({
      id: "producto-1",
      price: new Prisma.Decimal("8500"),
      originalPrice: new Prisma.Decimal("15000"),
      quantity: 8,
      active: false,
    });

    const result = await service.updatePrice(
      "producto-1",
      "propietario-1",
      {
        price: 8500,
        originalPrice: 15000,
      },
    );

    expect(result.discountPercentage).toBe(43.33);
  });

  it("rechaza un precio de oferta mayor al original", async () => {
    await expect(
      service.updatePrice(
        "producto-1",
        "propietario-1",
        {
          price: 20000,
          originalPrice: 15000,
        },
      ),
    ).rejects.toThrow(BadRequestException);

    expect(updateMany).not.toHaveBeenCalled();
  });

  it("rechaza precios negativos y valores no finitos", async () => {
    await expect(
      service.updatePrice(
        "producto-1",
        "propietario-1",
        {
          price: -500,
          originalPrice: 15000,
        },
      ),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.updatePrice(
        "producto-1",
        "propietario-1",
        {
          price: Number.POSITIVE_INFINITY,
          originalPrice: 15000,
        },
      ),
    ).rejects.toThrow(BadRequestException);

    expect(updateMany).not.toHaveBeenCalled();
  });

  it("impide actualizar precios de productos ajenos", async () => {
    updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.updatePrice(
        "producto-ajeno",
        "otro-usuario",
        {
          price: 5000,
          originalPrice: 10000,
        },
      ),
    ).rejects.toThrow(NotFoundException);

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "producto-ajeno",
          business: {
            ownerId: "otro-usuario",
            verified: true,
          },
        },
      }),
    );

    expect(findProduct).not.toHaveBeenCalled();
  });

  it("consulta públicamente solo productos activos y disponibles", async () => {
    findProduct.mockResolvedValue({
      id: "producto-1",
      name: "Producto disponible",
      active: true,
      quantity: 5,
    });

    const result = await service.findPublicById("producto-1");

    expect(findProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "producto-1",
          active: true,
          quantity: {
            gt: 0,
          },
          business: {
            verified: true,
          },
        },
      }),
    );

    expect(result).toMatchObject({
      id: "producto-1",
    });
  });

  it("rechaza el acceso público a productos no disponibles", async () => {
    findProduct.mockResolvedValue(null);

    await expect(
      service.findPublicById("producto-inactivo"),
    ).rejects.toThrow(NotFoundException);
  });
});
