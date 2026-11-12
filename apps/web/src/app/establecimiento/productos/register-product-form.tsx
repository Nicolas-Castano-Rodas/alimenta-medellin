
"use client";

import { useEffect, useState, type FormEvent } from "react";

type Business = {
  id: string;
  name: string;
  verified: boolean;
};

type RegisterProductFormProps = {
  onCreated: () => void;
};

type ApiResult = {
  message?: string;
};

const inputClass =
  "w-full rounded-2xl border border-[#D3DFD2] bg-[#F7F9F5] px-5 py-4 outline-none transition focus:border-[#4E8B55] focus:ring-2 focus:ring-[#4E8B55]/15 disabled:opacity-60";

const decimalPattern = /^\d+(\.\d{1,2})?$/;
const MAX_PRICE = 9999999999.99;

function parsePrice(value: string): number | null {
  const normalized = value.trim();

  if (!decimalPattern.test(normalized)) {
    return null;
  }

  const number = Number(normalized);

  if (
    !Number.isFinite(number) ||
    number < 0.01 ||
    number > MAX_PRICE
  ) {
    return null;
  }

  return number;
}

export default function RegisterProductForm({
  onCreated,
}: RegisterProductFormProps) {
  const [open, setOpen] = useState(false);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [businessError, setBusinessError] = useState("");

  const [businessId, setBusinessId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("paquete");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();

    async function loadBusinesses() {
      setLoadingBusinesses(true);
      setBusinessError("");

      try {
        const response = await fetch("/api/panel/businesses", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("No se pudieron consultar los establecimientos.");
        }

        const result: unknown = await response.json();

        if (
          !Array.isArray(result) ||
          !result.every(
            (item: unknown) =>
              typeof item === "object" &&
              item !== null &&
              "id" in item &&
              typeof item.id === "string" &&
              "name" in item &&
              typeof item.name === "string" &&
              "verified" in item &&
              typeof item.verified === "boolean",
          )
        ) {
          throw new Error("Respuesta de establecimientos inválida.");
        }

        if (!controller.signal.aborted) {
          const verified = (result as Business[]).filter(
            (business) => business.verified,
          );

          setBusinesses(verified);
        }
      } catch {
        if (!controller.signal.aborted) {
          setBusinessError(
            "No fue posible consultar tus establecimientos. Comprueba tu sesión y la conexión con NestJS.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingBusinesses(false);
        }
      }
    }

    void loadBusinesses();

    return () => controller.abort();
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setSuccess("");

    const offer = parsePrice(price);
    const original = parsePrice(originalPrice);
    const amount = Number(quantity);

    if (
      !businesses.some((business) => business.id === businessId)
    ) {
      setError("Selecciona un establecimiento verificado.");
      return;
    }

    if (name.trim().length < 3 || name.trim().length > 150) {
      setError("El nombre debe tener entre 3 y 150 caracteres.");
      return;
    }

    if (description.length > 1000) {
      setError("La descripción no puede superar 1.000 caracteres.");
      return;
    }

    if (
      category.trim().length < 3 ||
      category.trim().length > 80
    ) {
      setError("La categoría debe tener entre 3 y 80 caracteres.");
      return;
    }

    if (offer === null || original === null) {
      setError(
        "Introduce precios válidos, positivos y con máximo dos decimales.",
      );
      return;
    }

    if (offer > original) {
      setError(
        "El precio de oferta no puede superar el precio original.",
      );
      return;
    }

    if (
      quantity.trim() === "" ||
      !Number.isInteger(amount) ||
      amount < 0 ||
      amount > 1000000
    ) {
      setError(
        "La cantidad debe ser un número entero entre 0 y 1.000.000.",
      );
      return;
    }

    if (unit.trim().length < 1 || unit.trim().length > 50) {
      setError("La unidad debe tener entre 1 y 50 caracteres.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/panel/products", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          name: name.trim(),
          ...(description.trim()
            ? { description: description.trim() }
            : {}),
          category: category.trim(),
          price: offer,
          originalPrice: original,
          quantity: amount,
          unit: unit.trim(),
        }),
      });

      const result = (await response.json()) as ApiResult;

      if (!response.ok) {
        setError(
          typeof result.message === "string"
            ? result.message
            : "No fue posible registrar el producto.",
        );
        return;
      }

      setSuccess(
        "Producto registrado correctamente. Permanecerá inactivo hasta su autorización.",
      );

      setBusinessId("");
      setName("");
      setDescription("");
      setCategory("");
      setPrice("");
      setOriginalPrice("");
      setQuantity("");
      setUnit("paquete");
      setOpen(false);

      onCreated();
    } catch {
      setError(
        "No fue posible conectar con el servidor. Intenta nuevamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setOpen((current) => !current);
            setError("");
            setSuccess("");
          }}
          disabled={submitting}
          className="rounded-full bg-[#123B2C] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#285843] disabled:opacity-60"
        >
          {open ? "Cancelar registro" : "+ Registrar producto"}
        </button>
      </div>

      {success && (
        <p
          role="status"
          className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800"
        >
          {success}
        </p>
      )}

      {open && (
        <section className="mt-7 rounded-[2rem] border border-[#DCEBDD] bg-white p-7 shadow-sm sm:p-10">
          <h3 className="text-2xl font-black">
            Nuevo alimento
          </h3>

          <p className="mt-3 leading-7 text-[#68786D]">
            Registra un producto de uno de tus establecimientos
            verificados. El alimento se guardará como inactivo
            y no se publicará automáticamente.
          </p>

          {loadingBusinesses ? (
            <p role="status" className="mt-7 text-[#68786D]">
              Consultando establecimientos verificados...
            </p>
          ) : businessError ? (
            <p
              role="alert"
              className="mt-7 rounded-2xl bg-red-50 p-5 text-sm text-red-700"
            >
              {businessError}
            </p>
          ) : businesses.length === 0 ? (
            <div className="mt-7 rounded-2xl bg-amber-50 p-6">
              <h4 className="font-bold text-amber-900">
                Necesitas un establecimiento verificado
              </h4>

              <p className="mt-3 text-sm leading-6 text-amber-800">
                Todavía no tienes establecimientos aprobados.
                Primero debes completar el proceso de verificación.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
              <div>
                <label
                  htmlFor="product-business"
                  className="mb-2 block text-sm font-bold"
                >
                  Establecimiento
                </label>

                <select
                  id="product-business"
                  required
                  value={businessId}
                  onChange={(event) =>
                    setBusinessId(event.target.value)
                  }
                  disabled={submitting}
                  className={inputClass}
                >
                  <option value="">
                    Selecciona un establecimiento
                  </option>

                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="product-name"
                  className="mb-2 block text-sm font-bold"
                >
                  Nombre del alimento
                </label>

                <input
                  id="product-name"
                  type="text"
                  required
                  minLength={3}
                  maxLength={150}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej. Combo de pan artesanal"
                  disabled={submitting}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="product-description"
                  className="mb-2 block text-sm font-bold"
                >
                  Descripción (opcional)
                </label>

                <textarea
                  id="product-description"
                  rows={3}
                  maxLength={1000}
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe el contenido del alimento"
                  disabled={submitting}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="product-category"
                  className="mb-2 block text-sm font-bold"
                >
                  Categoría
                </label>

                <input
                  id="product-category"
                  type="text"
                  required
                  minLength={3}
                  maxLength={80}
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  placeholder="Ej. Panadería"
                  disabled={submitting}
                  className={inputClass}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="product-original-price"
                    className="mb-2 block text-sm font-bold"
                  >
                    Precio original (COP)
                  </label>

                  <input
                    id="product-original-price"
                    type="number"
                    required
                    min="0.01"
                    max="9999999999.99"
                    step="0.01"
                    value={originalPrice}
                    onChange={(event) =>
                      setOriginalPrice(event.target.value)
                    }
                    placeholder="15000"
                    disabled={submitting}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-price"
                    className="mb-2 block text-sm font-bold"
                  >
                    Precio de oferta (COP)
                  </label>

                  <input
                    id="product-price"
                    type="number"
                    required
                    min="0.01"
                    max="9999999999.99"
                    step="0.01"
                    value={price}
                    onChange={(event) =>
                      setPrice(event.target.value)
                    }
                    placeholder="7500"
                    disabled={submitting}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="product-quantity"
                    className="mb-2 block text-sm font-bold"
                  >
                    Cantidad disponible
                  </label>

                  <input
                    id="product-quantity"
                    type="number"
                    required
                    min="0"
                    max="1000000"
                    step="1"
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(event.target.value)
                    }
                    placeholder="8"
                    disabled={submitting}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-unit"
                    className="mb-2 block text-sm font-bold"
                  >
                    Unidad
                  </label>

                  <input
                    id="product-unit"
                    type="text"
                    required
                    minLength={1}
                    maxLength={50}
                    value={unit}
                    onChange={(event) =>
                      setUnit(event.target.value)
                    }
                    placeholder="Ej. paquete, unidad, kg"
                    disabled={submitting}
                    className={inputClass}
                  />
                </div>
              </div>

              <p className="rounded-2xl bg-[#F1F6ED] p-5 text-sm leading-6">
                La información de vencimiento, lote y conservación
                se completará posteriormente desde el módulo
                de seguridad alimentaria. Registrar un producto
                no significa que esté autorizado para venderse.
              </p>

              {error && (
                <p
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-[#123B2C] px-8 py-4 font-bold text-white transition hover:bg-[#285843] disabled:opacity-60"
              >
                {submitting
                  ? "Registrando alimento..."
                  : "Registrar alimento"}
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
