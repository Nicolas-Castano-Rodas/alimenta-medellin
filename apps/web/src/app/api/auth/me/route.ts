
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_BASE_URL ?? "http://127.0.0.1:3001";

const SESSION_COOKIE = "alimenta_session";

function jsonResponse(
  body: unknown,
  status: number,
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return jsonResponse(
      {
        authenticated: false,
        message: "No hay una sesión activa.",
      },
      401,
    );
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 401 || response.status === 403) {
      return jsonResponse(
        {
          authenticated: false,
          message: "La sesión ha expirado o no es válida.",
        },
        401,
      );
    }

    if (!response.ok) {
      return jsonResponse(
        {
          message: "No fue posible consultar el perfil.",
        },
        502,
      );
    }

    const user: unknown = await response.json();

    if (
      typeof user !== "object" ||
      user === null ||
      !("id" in user) ||
      typeof user.id !== "string" ||
      !("email" in user) ||
      typeof user.email !== "string" ||
      !("name" in user) ||
      typeof user.name !== "string" ||
      !("role" in user) ||
      typeof user.role !== "string"
    ) {
      return jsonResponse(
        { message: "La API devolvió un perfil inválido." },
        502,
      );
    }

    const profile = user as UserProfile;

    return jsonResponse(
      {
        authenticated: true,
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          createdAt: profile.createdAt,
        },
      },
      200,
    );
  } catch {
    return jsonResponse(
      {
        message:
          "No fue posible comunicarse con el servicio de autenticación.",
      },
      503,
    );
  }
}
