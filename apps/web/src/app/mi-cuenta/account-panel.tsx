
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type SessionResult = {
  authenticated?: boolean;
  user?: UserProfile;
  message?: string;
};

type AccountStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

function getRoleLabel(role: string) {
  const roles: Record<string, string> = {
    CONSUMER: "Consumidor",
    BUSINESS: "Establecimiento",
    FOUNDATION: "Fundación",
    ADMIN: "Administrador",
  };

  return roles[role] ?? role;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No disponible";
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
    timeZone: "America/Bogota",
  }).format(date);
}

export default function AccountPanel() {
  const router = useRouter();

  const [status, setStatus] =
    useState<AccountStatus>("loading");

  const [user, setUser] = useState<UserProfile | null>(
    null,
  );

  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401) {
          if (!controller.signal.aborted) {
            setUser(null);
            setStatus("unauthenticated");
          }
          return;
        }

        if (!response.ok) {
          throw new Error(
            "No fue posible consultar tu cuenta.",
          );
        }

        const data =
          (await response.json()) as SessionResult;

        if (
          data.authenticated !== true ||
          !data.user
        ) {
          throw new Error(
            "El servidor devolvió una sesión inválida.",
          );
        }

        if (!controller.signal.aborted) {
          setUser(data.user);
          setStatus("authenticated");
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(
            "No pudimos consultar tu perfil. Comprueba la conexión e intenta nuevamente.",
          );
          setStatus("error");
        }
      }
    }

    void loadProfile();

    return () => {
      controller.abort();
    };
  }, [reloadKey]);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("No se pudo cerrar la sesión.");
      }

      setUser(null);
      setStatus("unauthenticated");

      router.replace("/iniciar-sesion");
      router.refresh();
    } catch {
      setError(
        "No pudimos cerrar la sesión. Intenta nuevamente.",
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F6EF] text-[#123B2C]">
      <header className="border-b border-[#123B2C]/10 bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight"
          >
            🌿 ALIMENTA
          </Link>

          <Link
            href="/explorar"
            className="rounded-full border border-[#DCEBDD] px-5 py-3 text-sm font-semibold transition hover:bg-[#DCEBDD]"
          >
            Explorar alimentos
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-14">
        <div className="mb-10">
          <p className="font-bold text-[#4E8B55]">
            Mi espacio en ALIMENTA
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Mi cuenta
          </h1>

          <p className="mt-4 text-[#68786D]">
            Consulta tu información personal y administra
            tu sesión.
          </p>
        </div>

        {status === "loading" && (
          <div
            role="status"
            className="rounded-[2rem] border border-[#DCEBDD] bg-white p-10 shadow-sm"
          >
            <div className="h-7 w-52 animate-pulse rounded-xl bg-[#DCEBDD]" />
            <div className="mt-6 h-5 w-full animate-pulse rounded-lg bg-[#EAF1E4]" />
            <div className="mt-4 h-5 w-3/4 animate-pulse rounded-lg bg-[#EAF1E4]" />

            <p className="mt-8 text-[#68786D]">
              Verificando tu sesión...
            </p>
          </div>
        )}

        {status === "unauthenticated" && (
          <div className="rounded-[2rem] border border-[#DCEBDD] bg-white p-10 text-center shadow-sm">
            <div
              className="text-5xl"
              aria-hidden="true"
            >
              🔒
            </div>

            <h2 className="mt-6 text-2xl font-black">
              Necesitas iniciar sesión
            </h2>

            <p className="mt-4 text-[#68786D]">
              Tu sesión no está activa o ha expirado.
              Inicia sesión para consultar tus datos.
            </p>

            <Link
              href="/iniciar-sesion"
              className="mt-8 inline-flex rounded-full bg-[#123B2C] px-8 py-4 font-bold text-white transition hover:bg-[#285843]"
            >
              Iniciar sesión
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-[2rem] border border-red-200 bg-white p-10 text-center shadow-sm">
            <div
              className="text-5xl"
              aria-hidden="true"
            >
              ⚠️
            </div>

            <h2 className="mt-6 text-2xl font-black">
              No pudimos cargar tu cuenta
            </h2>

            <p
              role="alert"
              className="mt-4 text-[#68786D]"
            >
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                setError("");
                setStatus("loading");
                setReloadKey((value) => value + 1);
              }}
              className="mt-8 rounded-full bg-[#123B2C] px-8 py-4 font-bold text-white"
            >
              Reintentar
            </button>
          </div>
        )}

        {status === "authenticated" && user && (
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[#DCEBDD] bg-white p-7 shadow-sm sm:p-10">
              <div className="flex flex-wrap items-center gap-5">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-[#DCEBDD] text-3xl"
                  aria-hidden="true"
                >
                  👤
                </div>

                <div>
                  <p className="text-sm font-bold text-[#4E8B55]">
                    Sesión activa
                  </p>

                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                    {user.name}
                  </h2>

                  <p className="mt-2 text-[#68786D]">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            <section className="rounded-[2rem] border border-[#DCEBDD] bg-white p-7 shadow-sm sm:p-10">
              <h2 className="text-2xl font-black">
                Información de la cuenta
              </h2>

              <dl className="mt-8 divide-y divide-[#E0E8DC]">
                <div className="grid gap-2 py-5 sm:grid-cols-2">
                  <dt className="text-[#68786D]">
                    Nombre completo
                  </dt>
                  <dd className="font-bold break-words">
                    {user.name}
                  </dd>
                </div>

                <div className="grid gap-2 py-5 sm:grid-cols-2">
                  <dt className="text-[#68786D]">
                    Correo electrónico
                  </dt>
                  <dd className="font-bold break-all">
                    {user.email}
                  </dd>
                </div>

                <div className="grid gap-2 py-5 sm:grid-cols-2">
                  <dt className="text-[#68786D]">
                    Tipo de cuenta
                  </dt>
                  <dd className="font-bold">
                    {getRoleLabel(user.role)}
                  </dd>
                </div>

                <div className="grid gap-2 py-5 sm:grid-cols-2">
                  <dt className="text-[#68786D]">
                    Fecha de registro
                  </dt>
                  <dd className="font-bold">
                    {formatDate(user.createdAt)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-[2rem] border border-[#DCEBDD] bg-white p-7 shadow-sm sm:p-10">
              <h2 className="text-2xl font-black">
                Seguridad de la cuenta
              </h2>

              <p className="mt-4 leading-7 text-[#68786D]">
                Tu sesión utiliza una cookie HttpOnly.
                Por seguridad, las sesiones actuales
                tienen una duración máxima de 15 minutos.
              </p>

              {error && (
                <p
                  role="alert"
                  className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-8 inline-flex w-full items-center justify-center rounded-full border border-red-200 bg-red-50 px-8 py-4 font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loggingOut
                  ? "Cerrando sesión..."
                  : "Cerrar sesión"}
              </button>
            </section>
          </div>
        )}
      </section>

      <footer className="border-t border-[#DCEBDD] px-5 py-8 text-center text-sm text-[#68786D]">
        ALIMENTA © 2026 · Medellín, Colombia
      </footer>
    </main>
  );
}
