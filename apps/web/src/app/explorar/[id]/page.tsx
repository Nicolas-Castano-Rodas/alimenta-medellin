
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice, products } from "@/lib/products";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({
    id: String(product.id),
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((item) => String(item.id) === id);

  if (!product) {
    return { title: "Producto no encontrado | ALIMENTA" };
  }

  return {
    title: `${product.name} | ALIMENTA`,
    description: `Ficha de demostración de ${product.name} en Medellín.`,
  };
}

async function ProductDetails({
  params,
}: PageProps) {
  const { id } = await params;
  const product = products.find((item) => String(item.id) === id);

  if (!product) {
    notFound();
  }

  const discount = Math.round(
    (1 - product.price / product.originalPrice) * 100,
  );

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
        <nav aria-label="Ruta de navegación" className="mb-8 text-sm text-[#68786D]">
          <Link href="/" className="hover:underline">Inicio</Link>
          {" / "}
          <Link href="/explorar" className="hover:underline">
            Explorar
          </Link>
          {" / "}
          <span>{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="relative flex min-h-[350px] items-center justify-center rounded-[2.5rem] bg-[#E4EFE0] sm:min-h-[500px]">
            <span className="text-9xl sm:text-[180px]" aria-hidden="true">
              {product.emoji}
            </span>

            <span className="absolute left-6 top-6 rounded-full bg-[#123B2C] px-5 py-3 font-bold text-white">
              -{discount}% de ejemplo
            </span>
          </div>

          <section className="rounded-[2.5rem] bg-white p-7 shadow-sm sm:p-10">
            <p className="font-bold text-[#4E8B55]">
              {product.category}
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              {product.name}
            </h1>

            <p className="mt-5 leading-8 text-[#68786D]">
              Producto ficticio utilizado para demostrar cómo
              funcionarán las publicaciones de alimentos excedentes
              en ALIMENTA. No corresponde a una oferta disponible.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <span className="text-4xl font-black">
                {formatPrice(product.price)}
              </span>
              <span className="text-lg text-[#87978B] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            </div>

            <div className="mt-10 space-y-5 rounded-3xl bg-[#F1F6ED] p-6">
              <div>
                <p className="text-sm text-[#68786D]">Establecimiento</p>
                <p className="mt-1 font-bold">🏪 {product.business}</p>
              </div>

              <div>
                <p className="text-sm text-[#68786D]">Ubicación de ejemplo</p>
                <p className="mt-1 font-bold">
                  📍 {product.location}, Medellín
                </p>
              </div>

              <div>
                <p className="text-sm text-[#68786D]">
                  Disponibilidad y recogida
                </p>
                <p className="mt-1 font-bold">
                  Pendientes de implementación
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-[#DCEBDD] p-5 text-sm leading-6">
              <strong>Vista de demostración.</strong> Las reservas,
              compras y donaciones todavía no están habilitadas.
              Antes de publicar productos reales se incorporarán
              controles de seguridad alimentaria y trazabilidad.
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
            <div className="mb-10 h-8 w-48 animate-pulse rounded-xl bg-[#DCEBDD]" />

            <div className="grid gap-10 lg:grid-cols-2">
              <div className="min-h-[350px] animate-pulse rounded-[2.5rem] bg-[#DCEBDD] sm:min-h-[500px]" />

              <div className="rounded-[2.5rem] bg-white p-10">
                <div className="h-5 w-32 animate-pulse rounded-lg bg-[#DCEBDD]" />
                <div className="mt-6 h-12 w-3/4 animate-pulse rounded-xl bg-[#DCEBDD]" />
                <div className="mt-8 h-6 w-full animate-pulse rounded-lg bg-[#EAF1E4]" />
                <div className="mt-4 h-6 w-2/3 animate-pulse rounded-lg bg-[#EAF1E4]" />

                <p className="mt-10 text-sm font-medium text-[#4E8B55]">
                  Cargando información del producto...
                </p>
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
