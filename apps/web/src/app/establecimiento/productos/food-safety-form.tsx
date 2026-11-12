
"use client";

import { useState, type FormEvent } from "react";

type DateType =
  | "EXPIRATION"
  | "BEST_BEFORE"
  | "NOT_APPLICABLE";

type StorageCondition =
  | "AMBIENT"
  | "REFRIGERATED"
  | "FROZEN";

type FoodSafetyFormProps = {
  product: {
    id: string;
    name: string;
    dateType: DateType | null;
    expirationDate: string | null;
    storageCondition: StorageCondition | null;
    batchNumber: string | null;
    safetyNotes: string | null;
    updatedAt: string;
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
  "w-full rounded-xl border border-[#D3DFD2] bg-white px-4 py-3 outline-none transition focus:border-[#4E8B55] focus:ring-2 focus:ring-[#4E8B55]/15 disabled:opacity-60";

function isValidCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T12:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

export default function FoodSafetyForm({
  product,
  onUpdated,
}: FoodSafetyFormProps) {
  const [open, setOpen] = useState(false);

  const [dateType, setDateType] = useState<DateType | "">(
    product.dateType ?? "",
  );

  const [expirationDate, setExpirationDate] = useState(
    product.expirationDate?.slice(0, 10) ?? "",
  );

  const [storageCondition, setStorageCondition] =
    useState<StorageCondition | "">(
      product.storageCondition ?? "",
    );

  const [batchNumber, setBatchNumber] = useState(
    product.batchNumber ?? "",
  );
  const [safetyNotes, setSafetyNotes] = useState(
    product.safetyNotes ?? "",
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    if (!dateType) {
      setError("Selecciona el tipo de fecha.");
      return;
    }

    if (!storageCondition) {
      setError("Selecciona la condición de conservación.");
      return;
    }

    const requiresDate =
      dateType === "EXPIRATION" ||
      dateType === "BEST_BEFORE";

    if (requiresDate && !isValidCalendarDate(expirationDate)) {
      setError("Selecciona una fecha válida.");
      return;
    }

    if (requiresDate && dateType === "EXPIRATION") {
      const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Bogota",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());

      if (expirationDate <= today) {
        setError(
          "La fecha de vencimiento debe ser posterior al día de hoy.",
        );
        return;
      }
    }

    if (batchNumber.length > 100) {
      setError(
        "El número de lote no puede superar 100 caracteres.",
      );
      return;
    }

    if (safetyNotes.length > 1000) {
      setError(
        "Las observaciones no pueden superar 1.000 caracteres.",
      );
      return;
    }

    setLoading(true);

    const payload = {
      dateType,
      expirationDate: requiresDate
        ? `${expirationDate}T12:00:00.000Z`
        : null,
      storageCondition,
      batchNumber: batchNumber.trim(),
      safetyNotes: safetyNotes.trim(),
    };

    try {
      const response = await fetch(
        `/api/panel/products/${product.id}/food-safety`,
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

      const result =
        (await response.json()) as ApiResult;

      if (!response.ok) {
        setError(
          typeof result.message === "string"
            ? result.message
            : "No fue posible guardar la información sanitaria.",
        );
        return;
      }

      setSuccess(
        "Información sanitaria guardada. El producto permanece inactivo hasta su autorización.",
      );

      setOpen(false);
      onUpdated();
    } catch {
      setError(
        "No fue posible conectar con NestJS. Intenta nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!product.business.verified) {
    return null;
  }

  return (
    <section className="mt-5 border-t border-[#E0E8DC] pt-5">
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          setError("");
          setSuccess("");
        }}
        disabled={loading}
        className="w-full rounded-full border border-[#D3DFD2] bg-[#F1F6ED] px-4 py-3 text-sm font-bold transition hover:bg-[#DCEBDD] disabled:opacity-60"
      >
        {open
          ? "Cancelar edición sanitaria"
          : "🛡️ Seguridad alimentaria"}
      </button>

      {success && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          {success}
        </p>
      )}

      {open && (
        <form
          onSubmit={handleSubmit}
          className="mt-5 space-y-5 rounded-2xl bg-[#F1F6ED] p-5"
        >
          <div>
            <h3 className="text-lg font-black">
              Información de conservación
            </h3>

            <p className="mt-2 text-xs leading-6 text-[#68786D]">
              Registra únicamente información comprobada
              para este alimento. Este formulario no
              certifica su inocuidad ni lo habilita
              para la venta.
            </p>
          </div>

          <div>
            <label
              htmlFor={`date-type-${product.id}`}
              className="mb-2 block text-sm font-bold"
            >
              Tipo de fecha
            </label>

            <select
              id={`date-type-${product.id}`}
              value={dateType}
              onChange={(event) => {
                const next = event.target.value as DateType;
                setDateType(next);

                if (next === "NOT_APPLICABLE") {
                  setExpirationDate("");
                }
              }}
              disabled={loading}
              className={inputClass}
              required
            >
              <option value="" disabled>
                Selecciona un tipo de fecha
              </option>

              <option value="EXPIRATION">
                Fecha de vencimiento
              </option>

              <option value="BEST_BEFORE">
                Consumo preferente
              </option>

              <option value="NOT_APPLICABLE">
                No aplica
              </option>
            </select>
          </div>

          {dateType !== "NOT_APPLICABLE" && (
            <div>
              <label
                htmlFor={`expiration-${product.id}`}
                className="mb-2 block text-sm font-bold"
              >
                {dateType === "EXPIRATION"
                  ? "Fecha de vencimiento"
                  : "Fecha de consumo preferente"}
              </label>

              <input
                id={`expiration-${product.id}`}
                type="date"
                required
                value={expirationDate}
                onChange={(event) =>
                  setExpirationDate(event.target.value)
                }
                disabled={loading}
                className={inputClass}
              />

              <p className="mt-2 text-xs text-[#68786D]">
                Para fechas de vencimiento, el backend
                exige una fecha futura.
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor={`storage-${product.id}`}
              className="mb-2 block text-sm font-bold"
            >
              Condición de conservación
            </label>

            <select
              id={`storage-${product.id}`}
              required
              value={storageCondition}
              onChange={(event) =>
                setStorageCondition(
                  event.target.value as StorageCondition,
                )
              }
              disabled={loading}
              className={inputClass}
            >
              <option value="" disabled>
                Selecciona la conservación
              </option>

              <option value="AMBIENT">
                Temperatura ambiente
              </option>
              <option value="REFRIGERATED">
                Refrigerado
              </option>
              <option value="FROZEN">
                Congelado
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor={`batch-${product.id}`}
              className="mb-2 block text-sm font-bold"
            >
              Número de lote (opcional)
            </label>

            <input
              id={`batch-${product.id}`}
              type="text"
              maxLength={100}
              value={batchNumber}
              onChange={(event) =>
                setBatchNumber(event.target.value)
              }
              placeholder="Ej. LOTE-2026-001"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor={`notes-${product.id}`}
              className="mb-2 block text-sm font-bold"
            >
              Observaciones sanitarias (opcional)
            </label>

            <textarea
              id={`notes-${product.id}`}
              rows={4}
              maxLength={1000}
              value={safetyNotes}
              onChange={(event) =>
                setSafetyNotes(event.target.value)
              }
              placeholder="Ej. Mantener refrigerado entre las temperaturas recomendadas por el fabricante."
              disabled={loading}
              className={inputClass}
            />

            <p className="mt-2 text-xs text-[#68786D]">
              {safetyNotes.length}/1000 caracteres
            </p>
          </div>

          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900">
            Guardar estos datos deja el producto
            inactivo. La revisión y autorización
            de publicación son procesos separados.
          </p>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#123B2C] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#285843] disabled:opacity-60"
          >
            {loading
              ? "Guardando información..."
              : "Guardar información sanitaria"}
          </button>
        </form>
      )}
    </section>
  );
}
