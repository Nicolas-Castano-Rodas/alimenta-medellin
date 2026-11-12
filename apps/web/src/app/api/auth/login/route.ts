
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_BASE_URL ?? "http://127.0.0.1:3001";

const SESSION_COOKIE = "alimenta_session";
const SESSION_DURATION = 900;

type LoginResponse = {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { message: "Origen de solicitud no autorizado." },
      { status: 403 },
    );
  }

  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    return NextResponse.json(
      { message: "Se requiere contenido JSON." },
      { status: 415 },
    );
  }

  let credentials: unknown;

  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json(
      { message: "El cuerpo de la solicitud no es válido." },
      { status: 400 },
    );
  }

  if (
    typeof credentials !== "object" ||
    credentials === null ||
    Array.isArray(credentials)
  ) {
    return NextResponse.json(
      { message: "Credenciales no válidas." },
      { status: 400 },
    );
  }

  const values = credentials as Record<string, unknown>;

  if (
    typeof values.email !== "string" ||
    typeof values.password !== "string" ||
    !values.email.trim() ||
    !values.password
  ) {
    return NextResponse.json(
      { message: "Correo y contraseña son obligatorios." },
      { status: 400 },
    );
  }

  try {
    const apiResponse = await fetch(
      `${API_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );

    if (!apiResponse.ok) {
      if (apiResponse.status === 401) {
        return NextResponse.json(
          { message: "Correo o contraseña incorrectos." },
          { status: 401 },
        );
      }

      if (apiResponse.status === 400) {
        return NextResponse.json(
          { message: "Los datos enviados no son válidos." },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { message: "No se pudo iniciar sesión." },
        { status: 502 },
      );
    }

    const data = (await apiResponse.json()) as LoginResponse;

    if (
      typeof data.access_token !== "string" ||
      !data.access_token ||
      !data.user ||
      typeof data.user.id !== "string"
    ) {
      return NextResponse.json(
        { message: "Respuesta de autenticación inválida." },
        { status: 502 },
      );
    }

    const response = NextResponse.json({
      message: "Sesión iniciada correctamente.",
      user: data.user,
    });

    response.cookies.set({
      name: SESSION_COOKIE,
      value: data.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION,
    });

    response.headers.set("Cache-Control", "no-store");

    return response;
  } catch {
    return NextResponse.json(
      {
        message:
          "No fue posible comunicarse con el servicio de autenticación.",
      },
      { status: 503 },
    );
  }
}
