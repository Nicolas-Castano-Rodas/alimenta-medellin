
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/marketplace/product-card";
import type { Product } from "@/lib/products";

type ExploreClientProps = {
  products: Product[];
};

export default function ExploreClient({
  products,
}: ExploreClientProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");

  const categories = useMemo(
    () => [
      "Todos",
      ...Array.from(
        new Set(products.map((product) => product.category)),
      ).sort((a, b) => a.localeCompare(b, "es-CO")),
    ],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es-CO");

    return products.filter((product) => {
      const matchesCategory =
        category === "Todos" || product.category === category;

      const matchesSearch = [
        product.name,
        product.business,
        product.location,
      ].some((value) =>
        value.toLocaleLowerCase("es-CO").includes(term),
      );

      return matchesCategory && matchesSearch;
    });
  }, [products, search, category]);

  return (
    <main className="min-h-screen bg-[#F7F6EF] text-[#123B2C]">
      <header className="border-b border-[#123B2C]/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight"
          >
            🌿 ALIMENTA
          </Link>

          <Link
            href="/"
            className="rounded-full border border-[#123B2C]/20 px-5 py-2.5 text-sm font-semibold hover:bg-[#DCEBDD]"
          >
            Volver al inicio
          </Link>
        </div>
      </header>

      <section className="bg-[#123B2C] px-5 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
            🌱 Marketplace · Medellín
          </span>

          <h1 className="mt-7 text-4xl font-black tracking-tight sm:text-6xl">
            Descubre alimentos.
            <br />
            <span className="text-[#A9D4A9]">Aprovecha oportunidades.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#D2E3D7]">
            Explora alimentos publicados por comercios verificados en
            Medellín y descubre oportunidades para aprovecharlos.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="rounded-3xl border border-[#DCEBDD] bg-white p-6 shadow-sm">
          <label
            htmlFor="product-search"
            className="mb-3 block font-bold"
          >
            Buscar alimentos o barrios
          </label>

          <input
            id="product-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ej. frutas, pan, Laureles..."
            className="w-full rounded-2xl border border-[#D3DFD2] bg-[#F7F9F5] px-5 py-4 outline-none focus:border-[#4E8B55]"
          />

          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  category === item
                    ? "bg-[#123B2C] text-white"
                    : "bg-[#EEF3EB] text-[#123B2C] hover:bg-[#DCEBDD]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-7 mt-12 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-semibold text-[#4E8B55]">
              Catálogo de alimentos disponibles
            </p>
            <h2 className="mt-2 text-3xl font-black">
              Alimentos para aprovechar
            </h2>
          </div>

          <p className="text-sm text-[#65766B]" aria-live="polite">
            {filteredProducts.length} productos disponibles
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-[#DCEBDD] bg-white px-6 py-16 text-center">
            <p className="text-5xl">🔎</p>
            <h3 className="mt-4 text-2xl font-bold">
              {products.length === 0
                ? "Todavía no hay alimentos publicados"
                : "No encontramos coincidencias"}
            </h3>
            <p className="mt-3 text-[#68786D]">
              {products.length === 0
                ? "Estamos preparando nuevas oportunidades de aprovechamiento alimentario."
                : "Prueba con otra palabra o selecciona otra categoría."}
            </p>

            {products.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("Todos");
                }}
                className="mt-6 rounded-full bg-[#123B2C] px-6 py-3 font-semibold text-white"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </section>

      <footer className="mt-12 border-t border-[#DCEBDD] px-5 py-8 text-center text-sm text-[#68786D]">
        ALIMENTA © 2026 · Medellín, Colombia
      </footer>
    </main>
  );
}
