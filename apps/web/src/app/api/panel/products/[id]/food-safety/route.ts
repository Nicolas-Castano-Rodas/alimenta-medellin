
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_BASE_URL ?? "http://127.0.0.1:3001";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DATE_TYPES = [
  "EXPIRATION",
  "BEST_BEFORE",
  "NOT_APPLICABLE",
];

type Context = {
  params: Promise<{ id: string }>;
};

function respond(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: Context,
) {
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

  const token =
    request.cookies.get("alimenta_session")?.value;

  if (!token) {
    return respond(
      { message: "Debes iniciar sesión." },
      401,
    );
  }

  const { id } = await params;

  if (!UUID_V4.test(id)) {
    return respond(
      { message: "Identificador de producto inválido." },
      400,
    );
  }

  let body: unknown;

  try {
    const raw = await request.text();

    if (raw.length > 8192) {
      return respond(
        { message: "La solicitud supera el tamaño permitido." },
        413,
      );
    }

    body = JSON.parse(raw) as unknown;
  } catch {
    return respond(
      { message: "El cuerpo JSON no es válido." },
      400,
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return respond(
      { message: "Debes proporcionar datos válidos." },
      400,
    );
  }

  const values = body as Record<string, unknown>;

  const allowedFields = [
    "dateType",
    "expirationDate",
    "storageCondition",
    "batchNumber",
    "safetyNotes",
  ];

  const fields = Object.keys(values);

  if (
    fields.length === 0 ||
    fields.some((field) => !allowedFields.includes(field))
  ) {
    return respond(
      { message: "La solicitud contiene campos no permitidos." },
      400,
    );
  }

  if (
    values.dateType !== undefined &&
    (typeof values.dateType !== "string" ||
      !DATE_TYPES.includes(values.dateType))
  ) {
    return respond(
      { message: "Tipo de fecha no válido." },
      400,
    );
  }

  if (
    values.expirationDate !== undefined &&
    values.expirationDate !== null &&
    (typeof values.expirationDate !== "string" ||
      values.expirationDate.trim().length === 0)
  ) {
    return respond(
      { message: "Fecha no válida." },
      400,
    );
  }

  if (
    values.storageCondition !== undefined &&
    typeof values.storageCondition !== "string"
  ) {
    return respond(
      { message: "Condición de conservación no válida." },
      400,
    );
  }

  if (
    values.batchNumber !== undefined &&
    (typeof values.batchNumber !== "string" ||
      values.batchNumber.length > 100)
  ) {
    return respond(
      { message: "El lote no puede superar 100 caracteres." },
      400,
    );
  }

  if (
    values.safetyNotes !== undefined &&
    (typeof values.safetyNotes !== "string" ||
      values.safetyNotes.length > 1000)
  ) {
    return respond(
      {
        message:
          "Las observaciones no pueden superar 1.000 caracteres.",
      },
      400,
    );
  }

  const payload = {
    ...(values.dateType !== undefined && {
      dateType: values.dateType,
    }),
    ...(values.expirationDate !== undefined && {
      expirationDate: values.expirationDate,
    }),
    ...(values.storageCondition !== undefined && {
      storageCondition: values.storageCondition,
    }),
    ...(values.batchNumber !== undefined && {
      batchNumber: values.batchNumber,
    }),
    ...(values.safetyNotes !== undefined && {
      safetyNotes: values.safetyNotes,
    }),
  };

  try {
    const apiResponse = await fetch(
      `${API_BASE_URL}/products/${id}/food-safety`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
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

    if (
      apiResponse.status === 403 ||
      apiResponse.status === 404
    ) {
      return respond(
        {
          message:
            "Producto no encontrado o no autorizado.",
        },
        apiResponse.status,
      );
    }

    if (apiResponse.status === 400) {
      return respond(
        {
          message:
            "Los datos sanitarios no cumplen las reglas de validación.",
        },
        400,
      );
    }

    if (!apiResponse.ok) {
      return respond(
        {
          message:
            "No se pudo actualizar la información sanitaria.",
        },
        502,
      );
    }

    const result: unknown = await apiResponse.json();

    return respond(result, 200);
  } catch {
    return respond(
      {
        message:
          "No fue posible conectar con el servicio de seguridad alimentaria.",
      },
      503,
    );
  }
}
