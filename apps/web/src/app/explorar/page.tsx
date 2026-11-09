
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  business: string;
  location: string;
  emoji: string;
};

const products: Product[] = [
  {
    id: 1,
    name: "Canasta de frutas frescas",
    category: "Frutas y verduras",
    price: 12000,
    originalPrice: 24000,
    business: "Comercio de demostración A",
    location: "Laureles",
    emoji: "🍎",
  },
  {
    id: 2,
    name: "Paquete de pan artesanal",
    category: "Panadería",
    price: 6500,
    originalPrice: 13000,
    business: "Comercio de demostración B",
    location: "Belén",
    emoji: "🥖",
  },
  {
    id: 3,
    name: "Almuerzo del día",
    category: "Restaurantes",
    price: 14000,
    originalPrice: 28000,
    business: "Comercio de demostración C",
    location: "El Poblado",
    emoji: "🥗",
  },
  {
    id: 4,
    name: "Canasta de verduras",
    category: "Frutas y verduras",
    price: 9000,
    originalPrice: 18000,
    business: "Comercio de demostración D",
    location: "Robledo",
    emoji: "🥬",
  },
  {
    id: 5,
    name: "Combo de repostería",
    category: "Panadería",
    price: 8000,
    originalPrice: 16000,
    business: "Comercio de demostración E",
    location: "Buenos Aires",
    emoji: "🥐",
  },
  {
    id: 6,
    name: "Canasta de productos variados",
    category: "Supermercados",
    price: 20000,
    originalPrice: 40000,
    business: "Comercio de demostración F",
    location: "La América",
    emoji: "🛒",
  },
];

const categories = [
  "Todos",
  "Frutas y verduras",
  "Panadería",
  "Restaurantes",
  "Supermercados",
];

const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");

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
  }, [search, category]);

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
            🌱 Marketplace · Vista de demostración
          </span>

          <h1 className="mt-7 text-4xl font-black tracking-tight sm:text-6xl">
            Descubre alimentos.
            <br />
            <span className="text-[#A9D4A9]">Aprovecha oportunidades.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#D2E3D7]">
            Explora cómo funcionará nuestro catálogo de alimentos
            excedentes en Medellín, con descuentos y comercios cercanos.
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
              Catálogo de demostración
            </p>
            <h2 className="mt-2 text-3xl font-black">
              Alimentos para aprovechar
            </h2>
          </div>

          <p className="text-sm text-[#65766B]" aria-live="polite">
            {filteredProducts.length} productos de ejemplo
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const discount = Math.round(
                (1 - product.price / product.originalPrice) * 100,
              );

              return (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-[2rem] border border-[#E0E8DC] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative flex h-56 items-center justify-center bg-[#EAF1E4]">
                    <span className="text-8xl" aria-hidden="true">
                      {product.emoji}
                    </span>

                    <span className="absolute left-5 top-5 rounded-full bg-[#123B2C] px-4 py-2 text-sm font-bold text-white">
                      -{discount}%
                    </span>
                  </div>

                  <div className="p-6">
                    <p className="text-sm font-semibold text-[#4E8B55]">
                      {product.category}
                    </p>

                    <h3 className="mt-2 text-xl font-black">
                      {product.name}
                    </h3>

                    <p className="mt-3 text-sm text-[#68786D]">
                      🏪 {product.business}
                    </p>
                    <p className="mt-1 text-sm text-[#68786D]">
                      📍 {product.location}, Medellín
                    </p>

                    <div className="mt-6 flex items-center gap-3">
                      <span className="text-2xl font-black">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-sm text-[#89958B] line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    </div>

                    <div className="mt-6 rounded-xl bg-[#DCEBDD] px-4 py-3 text-center text-sm font-semibold">
                      Producto de demostración
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-[#DCEBDD] bg-white px-6 py-16 text-center">
            <p className="text-5xl">🔎</p>
            <h3 className="mt-4 text-2xl font-bold">
              No encontramos coincidencias
            </h3>
            <p className="mt-3 text-[#68786D]">
              Prueba con otra palabra o selecciona otra categoría.
            </p>

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
          </div>
        )}
      </section>

      <footer className="mt-12 border-t border-[#DCEBDD] px-5 py-8 text-center text-sm text-[#68786D]">
        ALIMENTA © 2026 · Medellín, Colombia · Datos ficticios de demostración
      </footer>
    </main>
  );
}
