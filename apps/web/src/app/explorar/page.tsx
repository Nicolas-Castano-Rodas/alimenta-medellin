import { Suspense } from "react";

import ExploreClient from "./explore-client";
import { getCatalogProducts } from "@/lib/catalog-api";
import type { Product } from "@/lib/products";

async function CatalogContent() {
  const apiProducts = await getCatalogProducts();

  const products: Product[] = apiProducts.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    price: Number(product.price),
    originalPrice: Number(product.originalPrice),
    business: product.business.name,
    location: product.business.city,
    emoji: "🥬",
    description: product.description ?? "",
    quantity: product.quantity,
    unit: product.unit,
    storage: "Información pendiente de mostrar",
    pickup: "Reservas y recogidas no habilitadas",
  }));

  return <ExploreClient products={products} />;
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F7F6EF] px-5 py-20 text-[#123B2C]">
          <div className="mx-auto max-w-7xl">
            <div className="h-10 w-72 animate-pulse rounded-xl bg-[#DCEBDD]" />
            <div className="mt-8 h-6 w-56 animate-pulse rounded-lg bg-[#DCEBDD]" />
            <p className="mt-6 text-[#68786D]">
              Cargando alimentos disponibles...
            </p>
          </div>
        </main>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
