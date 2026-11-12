import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getCatalogProductById } from "@/lib/catalog-api";
import { formatPrice } from "@/lib/products";

export const metadata: Metadata = {
  title: "Detalle del producto | ALIMENTA",
  description:
    "Consulta alimentos publicados por establecimientos verificados en ALIMENTA.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getStorageLabel(
  value: "AMBIENT" | "REFRIGERATED" | "FROZEN" | null,
) {
  switch (value) {
    case "AMBIENT":
      return "Conservación a temperatura ambiente";
    case "REFRIGERATED":
      return "Requiere refrigeración";
    case "FROZEN":
      return "Requiere congelación";
    default:
      return "Información de conservación no disponible";
  }
}

async function ProductDetails({ params }: PageProps) {
  const { id } = await params;

  if (!UUID_V4.test(id)) {
    notFound();
  }

  const product = await getCatalogProductById(id);

  if (!product) {
    notFound();
  }

  const price = Number(product.price);
  const originalPrice = Number(product.originalPrice);

  const discount =
    originalPrice > 0
      ? Math.round((1 - price / originalPrice) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-[#F7F6EF] text-[#123B2C]">
      <header className="border-b border-[#DCEBDD] bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-6">
          <Link href="/" className="text-2xl font-black">
            🌿 ALIMENTA
          </Link>

          <Link
            href="/explorar"
            className="rounded-full border border-[#DCEBDD] px-5 py-3 text-sm font-semibold hover:bg-[#DCEBDD]"
          >
            Volver al catálogo
          </Link>
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-12">
        <nav
          aria-label="Ruta de navegación"
          className="mb-8 text-sm text-[#68786D]"
        >
          <Link href="/" className="hover:underline">
            Inicio
          </Link>
          {" / "}
          <Link href="/explorar" className="hover:underline">
            Explorar
          </Link>
          {" / "}
          <span>{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="relative flex min-h-[350px] items-center justify-center rounded-[2.5rem] bg-[#E4EFE0] sm:min-h-[500px]">
            <span
              className="text-9xl sm:text-[180px]"
              aria-hidden="true"
            >
              🥬
            </span>

            {discount > 0 && (
              <span className="absolute left-6 top-6 z-10 rounded-full bg-[#123B2C] px-5 py-3 font-bold text-white">
                -{discount}%
              </span>
            )}
          </div>

          <section className="rounded-[2.5rem] bg-white p-7 shadow-sm sm:p-10">
            <p className="font-bold text-[#4E8B55]">
              {product.category}
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              {product.name}
            </h1>

            <p className="mt-5 leading-8 text-[#68786D]">
              {product.description ??
                "El establecimiento no ha registrado una descripción."}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <span className="text-4xl font-black">
                {formatPrice(price)}
              </span>

              {originalPrice > price && (
                <span className="text-lg text-[#87978B] line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>

            <div className="mt-10 space-y-5 rounded-3xl bg-[#F1F6ED] p-6">
              <div>
                <p className="text-sm text-[#68786D]">
                  Establecimiento
                </p>
                <p className="mt-1 font-bold">
                  🏪 {product.business.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#68786D]">
                  Ciudad
                </p>
                <p className="mt-1 font-bold">
                  📍 {product.business.city}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#68786D]">
                  Existencias registradas
                </p>
                <p className="mt-1 font-bold">
                  📦 {product.quantity} {product.unit}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#68786D]">
                  Conservación declarada
                </p>
                <p className="mt-1 font-bold">
                  {getStorageLabel(product.storageCondition)}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#68786D]">
                  Recogida
                </p>
                <p className="mt-1 font-bold">
                  Pendiente de habilitación
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-[#DCEBDD] p-5 text-sm leading-6">
              Las reservas y compras todavía no están habilitadas.
              La información de conservación es declarada por el
              establecimiento y no constituye una certificación
              sanitaria.
            </div>

            <Link
              href="/explorar"
              className="mt-8 block rounded-full bg-[#123B2C] px-8 py-4 text-center font-bold text-white transition hover:bg-[#285843]"
            >
              Seguir explorando
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function ProductDetailPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F7F6EF] px-5 py-16 text-[#123B2C]">
          <div className="mx-auto max-w-7xl">
            <div className="h-10 w-48 animate-pulse rounded-xl bg-[#DCEBDD]" />
            <div className="mt-10 grid gap-10 lg:grid-cols-2">
              <div className="min-h-[350px] animate-pulse rounded-[2.5rem] bg-[#DCEBDD]" />
              <div className="rounded-[2.5rem] bg-white p-10">
                <p>Cargando información del producto...</p>
              </div>
            </div>
          </div>
        </main>
      }
    >
      <ProductDetails {...props} />
    </Suspense>
  );
}
