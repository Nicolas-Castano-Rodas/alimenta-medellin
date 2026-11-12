
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_BASE_URL ?? "http://127.0.0.1:3001";

const SESSION_COOKIE = "alimenta_session";

function respond(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return respond(
      { message: "Debes iniciar sesión para continuar." },
      401,
    );
  }

  try {
    const apiResponse = await fetch(
      `${API_BASE_URL}/products/mine`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );

    if (apiResponse.status === 401) {
      return respond(
        { message: "Tu sesión ha expirado." },
        401,
      );
    }

    if (apiResponse.status === 403) {
      return respond(
        {
          message:
            "No tienes autorización para consultar estos productos.",
        },
        403,
      );
    }

    if (!apiResponse.ok) {
      return respond(
        {
          message:
            "No fue posible consultar tus productos.",
        },
        502,
      );
    }

    const products: unknown = await apiResponse.json();

    if (!Array.isArray(products)) {
      return respond(
        {
          message:
            "La API devolvió un catálogo privado inválido.",
        },
        502,
      );
    }

    return respond(products, 200);
  } catch {
    return respond(
      {
        message:
          "No fue posible conectar con el servicio de productos.",
      },
      503,
    );
  }
}

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return respond(
      { message: "Origen no autorizado." },
      403,
    );
  }

  const contentType =
    request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.startsWith("application/json")) {
    return respond(
      { message: "Se requiere contenido JSON." },
      415,
    );
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return respond(
      { message: "Debes iniciar sesión." },
      401,
    );
  }

  let body: unknown;

  try {
    const raw = await request.text();

    if (raw.length > 16384) {
      return respond(
        { message: "La solicitud supera el tamaño permitido." },
        413,
      );
    }

    body = JSON.parse(raw) as unknown;
  } catch {
    return respond(
      { message: "Los datos enviados no son válidos." },
      400,
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return respond(
      { message: "Debes proporcionar un producto válido." },
      400,
    );
  }

  const data = body as Record<string, unknown>;

  // Construimos una lista explícita de campos.
  // Nunca aceptamos ownerId, active o verified.
  const productData = {
    businessId: data.businessId,
    name: data.name,
    description: data.description,
    category: data.category,
    price: data.price,
    originalPrice: data.originalPrice,
    quantity: data.quantity,
    unit: data.unit,
  };

  if (
    typeof productData.businessId !== "string" ||
    typeof productData.name !== "string" ||
    typeof productData.category !== "string" ||
    typeof productData.unit !== "string" ||
    typeof productData.price !== "number" ||
    typeof productData.originalPrice !== "number" ||
    typeof productData.quantity !== "number" ||
    !Number.isFinite(productData.price) ||
    !Number.isFinite(productData.originalPrice) ||
    !Number.isInteger(productData.quantity) ||
    productData.price <= 0 ||
    productData.originalPrice <= 0 ||
    productData.price > productData.originalPrice ||
    productData.quantity < 0 ||
    (productData.description !== undefined &&
      typeof productData.description !== "string")
  ) {
    return respond(
      { message: "Verifica los datos y precios del producto." },
      400,
    );
  }

  try {
    const apiResponse = await fetch(
      `${API_BASE_URL}/products`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(productData),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );

    if (apiResponse.status === 401) {
      return respond(
        { message: "Tu sesión ha expirado." },
        401,
      );
    }

    if (apiResponse.status === 403) {
      return respond(
        {
          message:
            "Solo puedes registrar productos en establecimientos propios y verificados.",
        },
        403,
      );
    }

    if (apiResponse.status === 400) {
      return respond(
        {
          message:
            "Los datos del producto no cumplen los requisitos del backend.",
        },
        400,
      );
    }

    if (!apiResponse.ok) {
      return respond(
        { message: "No fue posible registrar el producto." },
        502,
      );
    }

    const result: unknown = await apiResponse.json();

    if (
      typeof result !== "object" ||
      result === null ||
      !("id" in result) ||
      typeof result.id !== "string" ||
      !("active" in result) ||
      result.active !== false
    ) {
      return respond(
        { message: "La API devolvió una respuesta inesperada." },
        502,
      );
    }

    return respond(
      {
        message: "Producto registrado, pendiente de publicación.",
        product: result,
      },
      201,
    );
  } catch {
    return respond(
      {
        message:
          "No fue posible conectar con el servicio de productos.",
      },
      503,
    );
  }
}
