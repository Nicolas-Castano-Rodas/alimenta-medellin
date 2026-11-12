
"use client";

import { useState, type FormEvent } from "react";

type Props = {
  product: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    price: string | number;
    originalPrice: string | number;
    active: boolean;
    business: {
      verified: boolean;
    };
  };
  onUpdated: () => void;
};

type ApiResult = {
  message?: string;
};

const inputClass =
  "w-full rounded-xl border border-[#D3DFD2] bg-white px-4 py-3 outline-none focus:border-[#4E8B55]";

function parsePrice(value: string) {
  const normalized = value.trim();

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const number = Number(normalized);

  return Number.isFinite(number) &&
    number >= 0.01 &&
    number <= 9999999999.99
    ? number
    : null;
}

export default function EditProductForm({
  product,
  onUpdated,
}: Props) {
  const [open, setOpen] = useState<"stock" | "price" | null>(null);
  const [quantity, setQuantity] = useState(String(product.quantity));
  const [price, setPrice] = useState(String(product.price));
  const [originalPrice, setOriginalPrice] = useState(
    String(product.originalPrice),
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(
    event: FormEvent<HTMLFormElement>,
    operation: "stock" | "price",
  ) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setMessage("");

    let payload: Record<string, number>;

    if (operation === "stock") {
      const amount = Number(quantity);

      if (
        quantity.trim() === "" ||
        !Number.isInteger(amount) ||
        amount < 0 ||
        amount > 1000000
      ) {
        setError(
          "La cantidad debe ser un entero entre 0 y 1.000.000.",
        );
        return;
      }

      payload = { quantity: amount };
    } else {
      const offer = parsePrice(price);
      const original = parsePrice(originalPrice);

      if (offer === null || original === null || offer > original) {
        setError(
          "Verifica ambos precios. La oferta no puede superar el precio original.",
        );
        return;
      }

      payload = {
        price: offer,
        originalPrice: original,
      };
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/panel/products/${product.id}/${operation}`,
        {
          method: "PATCH",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = (await response.json()) as ApiResult;

      if (!response.ok) {
        setError(
          result.message ?? "No fue posible guardar los cambios.",
        );
        return;
      }

      setMessage(
        operation === "stock"
          ? "Existencias actualizadas correctamente."
          : "Precios actualizados. El producto queda inactivo y requiere revisión antes de publicarse.",
      );

      setOpen(null);
      onUpdated();
    } catch {
      setError(
        "No fue posible conectar con el servidor. Intenta nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  function toggle(operation: "stock" | "price") {
    setOpen((current) =>
      current === operation ? null : operation,
    );
    setError("");
    setMessage("");
    setQuantity(String(product.quantity));
    setPrice(String(product.price));
    setOriginalPrice(String(product.originalPrice));
  }

  if (!product.business.verified) {
    return (
      <p className="mt-5 rounded-xl bg-amber-50 p-4 text-xs text-amber-800">
        Este establecimiento no está verificado.
        No puedes modificar sus productos desde aquí.
      </p>
    );
  }

  return (
    <div className="mt-6 border-t border-[#E0E8DC] pt-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => toggle("stock")}
          disabled={loading}
          className="rounded-full bg-[#123B2C] px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
        >
          Editar existencias
        </button>

        <button
          type="button"
          onClick={() => toggle("price")}
          disabled={loading}
          className="rounded-full border border-[#D3DFD2] px-4 py-2 text-xs font-bold disabled:opacity-60"
        >
          Editar precios
        </button>
      </div>

      {open === "stock" && (
        <form
          onSubmit={(event) => submit(event, "stock")}
          className="mt-5 space-y-4 rounded-2xl bg-[#F1F6ED] p-4"
        >
          <label
            htmlFor={`stock-${product.id}`}
            className="block text-sm font-bold"
          >
            Cantidad disponible ({product.unit})
          </label>

          <input
            id={`stock-${product.id}`}
            type="number"
            min="0"
            max="1000000"
            step="1"
            required
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            disabled={loading}
            className={inputClass}
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#123B2C] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar existencias"}
          </button>
        </form>
      )}

      {open === "price" && (
        <form
          onSubmit={(event) => submit(event, "price")}
          className="mt-5 space-y-4 rounded-2xl bg-[#F1F6ED] p-4"
        >
          <div>
            <label
              htmlFor={`original-${product.id}`}
              className="mb-2 block text-sm font-bold"
            >
              Precio original (COP)
            </label>
            <input
              id={`original-${product.id}`}
              type="number"
              min="0.01"
              max="9999999999.99"
              step="0.01"
              required
              value={originalPrice}
              onChange={(event) =>
                setOriginalPrice(event.target.value)
              }
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor={`offer-${product.id}`}
              className="mb-2 block text-sm font-bold"
            >
              Precio de oferta (COP)
            </label>
            <input
              id={`offer-${product.id}`}
              type="number"
              min="0.01"
              max="9999999999.99"
              step="0.01"
              required
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              disabled={loading}
              className={inputClass}
            />
          </div>

          <p className="text-xs leading-5 text-[#68786D]">
            Modificar los precios hará que el producto
            permanezca inactivo hasta una nueva revisión.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#123B2C] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar precios"}
          </button>
        </form>
      )}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 p-4 text-xs text-red-700"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="mt-4 rounded-xl bg-green-50 p-4 text-xs text-green-800"
        >
          {message}
        </p>
      )}
    </div>
  );
}
