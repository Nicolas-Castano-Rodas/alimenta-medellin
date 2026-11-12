
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EditProductForm from "./edit-product-form";
import FoodSafetyForm from "./food-safety-form";
import RegisterProductForm from "./register-product-form";

type PrivateProduct = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: string;
  originalPrice: string;
  quantity: number;
  unit: string;
  active: boolean;
  imagePath: string | null;
  dateType: "EXPIRATION" | "BEST_BEFORE" | "NOT_APPLICABLE" | null;
  expirationDate: string | null;
  storageCondition: "AMBIENT" | "REFRIGERATED" | "FROZEN" | null;
  batchNumber: string | null;
  safetyNotes: string | null;
  createdAt: string;
  updatedAt: string;
  business: {
    id: string;
    name: string;
    verified: boolean;
  };
};

type LoadStatus =
  | "loading"
  | "ready"
  | "unauthenticated"
  | "forbidden"
  | "error";

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function formatMoney(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? currency.format(amount)
    : "No disponible";
}

export default function ProductsDashboard() {
  const [products, setProducts] = useState<PrivateProduct[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch("/api/panel/products", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        if (response.status === 401) {
          setProducts([]);
          setStatus("unauthenticated");
          return;
        }

        if (response.status === 403) {
          setProducts([]);
          setStatus("forbidden");
          return;
        }

        if (!response.ok) {
          throw new Error("No se pudieron cargar tus productos.");
        }

        const data: unknown = await response.json();

        if (
          !Array.isArray(data) ||
          !data.every(
            (item: unknown) =>
              typeof item === "object" &&
              item !== null &&
              "id" in item &&
              typeof item.id === "string" &&
              "name" in item &&
              typeof item.name === "string" &&
              "price" in item &&
              (typeof item.price === "string" ||
                typeof item.price === "number") &&
              "originalPrice" in item &&
              (typeof item.originalPrice === "string" ||
                typeof item.originalPrice === "number") &&
              "quantity" in item &&
              typeof item.quantity === "number" &&
              "unit" in item &&
              typeof item.unit === "string" &&
              "category" in item &&
              typeof item.category === "string" &&
              "active" in item &&
              typeof item.active === "boolean" &&
              "business" in item &&
              typeof item.business === "object" &&
              item.business !== null &&
              "id" in item.business &&
              typeof item.business.id === "string" &&
              "name" in item.business &&
              typeof item.business.name === "string",
          )
        ) {
          throw new Error("El servidor devolvió datos inválidos.");
        }

        if (!controller.signal.aborted) {
          setProducts(data as PrivateProduct[]);
          setStatus("ready");
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(
            "No pudimos consultar tu inventario. Comprueba la conexión con NestJS.",
          );
          setStatus("error");
        }
      }
    }

    void loadProducts();

    return () => controller.abort();
  }, [reload]);

  const active = products.filter((p) => p.active).length;
  const inactive = products.length - active;
  const outOfStock = products.filter((p) => p.quantity === 0).length;

  function retry() {
    setError("");
    setStatus("loading");
    setReload((value) => value + 1);
  }

  return (
    <main className="min-h-screen bg-[#F7F6EF] text-[#123B2C]">
      <header className="border-b border-[#DCEBDD] bg-white">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <Link href="/" className="text-2xl font-black">
            🌿 ALIMENTA
          </Link>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/establecimiento"
              className="text-sm font-semibold hover:underline"
            >
              Establecimientos
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
        <span className="inline-flex rounded-full bg-[#DCEBDD] px-5 py-2 text-sm font-bold text-[#285843]">
          Inventario privado
        </span>

        <h1 className="mt-6 text-4xl font-black sm:text-5xl">
          Mis productos
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-[#68786D]">
          Consulta los alimentos registrados por tus establecimientos,
          revisa sus existencias y conoce su estado de publicación.
        </p>

        {status === "loading" && (
          <div
            role="status"
            className="mt-10 rounded-[2rem] border border-[#DCEBDD] bg-white p-10"
          >
            Cargando inventario...
          </div>
        )}

        {status === "unauthenticated" && (
          <div className="mt-10 rounded-[2rem] border border-[#DCEBDD] bg-white p-10 text-center">
            <h2 className="text-2xl font-black">
              Necesitas iniciar sesión
            </h2>
            <p className="mt-4 text-[#68786D]">
              Tu sesión ha expirado o todavía no has iniciado sesión.
            </p>
            <Link
              href="/iniciar-sesion"
              className="mt-8 inline-flex rounded-full bg-[#123B2C] px-8 py-4 font-bold text-white"
            >
              Iniciar sesión
            </Link>
          </div>
        )}

        {status === "forbidden" && (
          <div className="mt-10 rounded-[2rem] border border-[#DCEBDD] bg-white p-10 text-center">
            <h2 className="text-2xl font-black">
              Acceso no autorizado
            </h2>
            <p className="mt-4 text-[#68786D]">
              Tu cuenta no tiene permisos para consultar estos productos.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="mt-10 rounded-[2rem] border border-red-200 bg-white p-10 text-center">
            <h2 className="text-2xl font-black">
              No pudimos cargar el inventario
            </h2>
            <p role="alert" className="mt-4 text-[#68786D]">
              {error}
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-7 rounded-full bg-[#123B2C] px-8 py-4 font-bold text-white"
            >
              Reintentar
            </button>
          </div>
        )}

        {status === "ready" && (
          <>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard label="Total de productos" value={products.length} icon="📦" />
              <SummaryCard label="Marcados activos" value={active} icon="✅" />
              <SummaryCard label="Inactivos" value={inactive} icon="⏳" />
              <SummaryCard label="Sin existencias" value={outOfStock} icon="📭" />
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">
                  Inventario registrado
                </h2>
                <p className="mt-2 text-sm text-[#68786D]">
                  Solo se muestran productos de tus establecimientos.
                </p>
              </div>

              <button
                type="button"
                onClick={retry}
                className="rounded-full border border-[#DCEBDD] bg-white px-6 py-3 text-sm font-bold hover:bg-[#EAF1E4]"
              >
                Actualizar inventario
              </button>
            </div>

            <div className="mt-6">
              <RegisterProductForm onCreated={retry} />
            </div>

            {products.length === 0 ? (
              <div className="mt-7 rounded-[2rem] border border-[#DCEBDD] bg-white px-7 py-14 text-center">
                <div className="text-6xl" aria-hidden="true">
                  🥬
                </div>
                <h3 className="mt-6 text-2xl font-black">
                  Todavía no tienes productos registrados
                </h3>
                <p className="mx-auto mt-4 max-w-xl leading-7 text-[#68786D]">
                  Los establecimientos verificados podrán registrar
                  productos desde este panel en el siguiente paso.
                </p>
              </div>
            ) : (
              <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="rounded-[2rem] border border-[#DCEBDD] bg-white p-7 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1E4] text-3xl"
                        aria-hidden="true"
                      >
                        🥖
                      </div>

                      <span
                        className={
                          product.active
                            ? "rounded-full bg-green-100 px-4 py-2 text-xs font-bold text-green-800"
                            : "rounded-full bg-amber-100 px-4 py-2 text-xs font-bold text-amber-800"
                        }
                      >
                        {product.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <p className="mt-6 text-sm font-bold text-[#4E8B55]">
                      {product.category}
                    </p>

                    <h3 className="mt-2 text-2xl font-black">
                      {product.name}
                    </h3>

                    <p className="mt-3 text-sm text-[#68786D]">
                      🏪 {product.business.name}
                    </p>

                    <div className="mt-6 border-t border-[#E0E8DC] pt-5">
                      <p className="text-sm text-[#68786D]">
                        Precio de oferta
                      </p>
                      <p className="mt-1 text-3xl font-black">
                        {formatMoney(product.price)}
                      </p>

                      {Number(product.originalPrice) >
                        Number(product.price) && (
                        <p className="mt-1 text-sm text-[#87978B] line-through">
                          {formatMoney(product.originalPrice)}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 rounded-2xl bg-[#F1F6ED] p-5">
                      <p className="text-sm text-[#68786D]">
                        Existencias registradas
                      </p>
                      <p className="mt-2 text-xl font-black">
                        {product.quantity} {product.unit}
                      </p>
                    </div>

                    <p className="mt-5 text-xs leading-6 text-[#68786D]">
                      {product.active
                        ? "Marcado como activo en el sistema. La disponibilidad pública también depende de las condiciones de publicación."
                        : "Producto inactivo. No aparece en el catálogo público."}
                    </p>

                    <EditProductForm
                      product={product}
                      onUpdated={retry}
                    />

                    <FoodSafetyForm
                      key={`${product.id}-${product.updatedAt}`}
                      product={product}
                      onUpdated={retry}
                    />
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
    <div className="rounded-[2rem] border border-[#DCEBDD] bg-white p-6 shadow-sm">
      <div className="text-3xl" aria-hidden="true">
        {icon}
      </div>
      <p className="mt-5 text-sm text-[#68786D]">{label}</p>
      <p className="mt-2 text-4xl font-black">{value}</p>
    </div>
  );
}
