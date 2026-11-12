
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RegisterBusinessForm from "./register-business-form";

type Business = {
  id: string;
  name: string;
  address: string;
  city: string;
  verified: boolean;
  createdAt: string;
};

type DashboardStatus =
  | "loading"
  | "ready"
  | "unauthenticated"
  | "forbidden"
  | "error";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeZone: "America/Bogota",
  }).format(date);
}

export default function BusinessDashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [status, setStatus] =
    useState<DashboardStatus>("loading");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBusinesses() {
      try {
        const response = await fetch(
          "/api/panel/businesses",
          {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted) return;

        if (response.status === 401) {
          setStatus("unauthenticated");
          return;
        }

        if (response.status === 403) {
          setStatus("forbidden");
          return;
        }

        if (!response.ok) {
          throw new Error(
            "No pudimos cargar tus establecimientos.",
          );
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error(
            "El servidor devolvió información inesperada.",
          );
        }

        const valid = data.every(
          (item: unknown) =>
            typeof item === "object" &&
            item !== null &&
            "id" in item &&
            typeof item.id === "string" &&
            "name" in item &&
            typeof item.name === "string" &&
            "address" in item &&
            typeof item.address === "string" &&
            "city" in item &&
            typeof item.city === "string" &&
            "verified" in item &&
            typeof item.verified === "boolean" &&
            "createdAt" in item &&
            typeof item.createdAt === "string",
        );

        if (!valid) {
          throw new Error(
            "Los datos de establecimientos son inválidos.",
          );
        }

        if (!controller.signal.aborted) {
          setBusinesses(data as Business[]);
          setStatus("ready");
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(
            "No fue posible consultar tus establecimientos. Verifica que NestJS esté funcionando.",
          );
          setStatus("error");
        }
      }
    }

    void loadBusinesses();

    return () => controller.abort();
  }, [retry]);

  const verifiedCount = businesses.filter(
    (business) => business.verified,
  ).length;

  const pendingCount =
    businesses.length - verifiedCount;

  function retryRequest() {
    setError("");
    setStatus("loading");
    setRetry((value) => value + 1);
  }

  return (
    <main className="min-h-screen bg-[#F7F6EF] text-[#123B2C]">
      <header className="border-b border-[#DCEBDD] bg-white">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight"
          >
            🌿 ALIMENTA
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/explorar"
              className="text-sm font-semibold hover:underline"
            >
              Explorar
            </Link>

            <Link
              href="/establecimiento/productos"
              className="text-sm font-semibold hover:underline"
            >
              Mis productos
            </Link>

            <Link
              href="/mi-cuenta"
              className="rounded-full border border-[#DCEBDD] px-5 py-3 text-sm font-semibold hover:bg-[#DCEBDD]"
            >
              Mi cuenta
            </Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="mb-10">
          <span className="inline-flex rounded-full bg-[#DCEBDD] px-5 py-2 text-sm font-bold text-[#285843]">
            Gestión de establecimientos
          </span>

          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
            Mi panel de establecimientos
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-[#68786D]">
            Consulta tus establecimientos registrados,
            revisa su estado de verificación y prepárate
            para administrar sus alimentos.
          </p>
        </div>

        {status === "loading" && (
          <div
            role="status"
            className="rounded-[2rem] border border-[#DCEBDD] bg-white p-10"
          >
            <div className="h-8 w-60 animate-pulse rounded-lg bg-[#DCEBDD]" />
            <div className="mt-6 h-5 w-full animate-pulse rounded-lg bg-[#EAF1E4]" />
            <p className="mt-6 text-[#68786D]">
              Cargando establecimientos...
            </p>
          </div>
        )}

        {status === "unauthenticated" && (
          <div className="rounded-[2rem] border border-[#DCEBDD] bg-white p-10 text-center">
            <div className="text-5xl" aria-hidden="true">
              🔒
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Inicia sesión para continuar
            </h2>

            <p className="mt-4 text-[#68786D]">
              Necesitas una sesión activa para consultar
              tus establecimientos.
            </p>

            <Link
              href="/iniciar-sesion"
              className="mt-7 inline-flex rounded-full bg-[#123B2C] px-8 py-4 font-bold text-white"
            >
              Iniciar sesión
            </Link>
          </div>
        )}

        {status === "forbidden" && (
          <div className="rounded-[2rem] border border-[#DCEBDD] bg-white p-10 text-center">
            <h2 className="text-2xl font-black">
              Acceso no autorizado
            </h2>

            <p className="mt-4 text-[#68786D]">
              Tu cuenta no tiene autorización para
              consultar este recurso.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-[2rem] border border-red-200 bg-white p-10 text-center">
            <h2 className="text-2xl font-black">
              No pudimos cargar el panel
            </h2>

            <p
              role="alert"
              className="mt-4 text-[#68786D]"
            >
              {error}
            </p>

            <button
              type="button"
              onClick={retryRequest}
              className="mt-7 rounded-full bg-[#123B2C] px-8 py-4 font-bold text-white"
            >
              Reintentar
            </button>
          </div>
        )}

        {status === "ready" && (
          <>
            <div className="grid gap-5 sm:grid-cols-3">
              <SummaryCard
                label="Mis establecimientos"
                value={businesses.length}
                icon="🏪"
              />

              <SummaryCard
                label="Verificados"
                value={verifiedCount}
                icon="✅"
              />

              <SummaryCard
                label="Pendientes de verificación"
                value={pendingCount}
                icon="⏳"
              />
            </div>

            <div className="mt-12">
              <RegisterBusinessForm onCreated={retryRequest} />
            </div>

            {businesses.length === 0 ? (
              <div className="mt-7 rounded-[2rem] border border-[#DCEBDD] bg-white px-7 py-14 text-center">
                <div
                  className="text-6xl"
                  aria-hidden="true"
                >
                  🏪
                </div>

                <h3 className="mt-6 text-2xl font-black">
                  Todavía no tienes establecimientos
                </h3>

                <p className="mx-auto mt-4 max-w-lg leading-7 text-[#68786D]">
                  Puedes registrar tu establecimiento
                  para solicitar su verificación y,
                  posteriormente, gestionar productos
                  desde ALIMENTA.
                </p>

                <p className="mt-6 text-sm font-semibold text-[#4E8B55]">
                  El formulario de registro de
                  establecimientos estará disponible
                  en el siguiente paso.
                </p>
              </div>
            ) : (
              <div className="mt-7 grid gap-6 md:grid-cols-2">
                {businesses.map((business) => (
                  <article
                    key={business.id}
                    className="rounded-[2rem] border border-[#DCEBDD] bg-white p-7 shadow-sm sm:p-8"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1E4] text-3xl"
                        aria-hidden="true"
                      >
                        🏪
                      </div>

                      <span
                        className={
                          business.verified
                            ? "rounded-full bg-[#DCEBDD] px-4 py-2 text-xs font-bold text-[#285843]"
                            : "rounded-full bg-amber-100 px-4 py-2 text-xs font-bold text-amber-800"
                        }
                      >
                        {business.verified
                          ? "Verificado"
                          : "Pendiente de verificación"}
                      </span>
                    </div>

                    <h3 className="mt-6 text-2xl font-black">
                      {business.name}
                    </h3>

                    <dl className="mt-6 space-y-4 text-sm">
                      <div>
                        <dt className="text-[#68786D]">
                          Dirección
                        </dt>

                        <dd className="mt-1 font-semibold">
                          📍 {business.address}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-[#68786D]">
                          Ciudad
                        </dt>

                        <dd className="mt-1 font-semibold">
                          {business.city}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-[#68786D]">
                          Fecha de registro
                        </dt>

                        <dd className="mt-1 font-semibold">
                          {formatDate(business.createdAt)}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-7 border-t border-[#E0E8DC] pt-5">
                      <p className="text-sm leading-6 text-[#68786D]">
                        {business.verified
                          ? "Este establecimiento está verificado. La gestión de productos se habilitará en los próximos pasos."
                          : "Este establecimiento aún no está verificado. No puede publicar productos en el catálogo público."}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <footer className="border-t border-[#DCEBDD] px-5 py-8 text-center text-sm text-[#68786D]">
        ALIMENTA © 2026 · Medellín, Colombia
      </footer>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-[2rem] border border-[#DCEBDD] bg-white p-7 shadow-sm">
      <div className="text-3xl" aria-hidden="true">
        {icon}
      </div>

      <p className="mt-5 text-sm font-semibold text-[#68786D]">
        {label}
      </p>

      <p className="mt-2 text-4xl font-black">
        {value}
      </p>
    </div>
  );
}
