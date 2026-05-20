"use client";

import { useState } from "react";

type FormFields = {
  interes: string;
  ejercicio: string;
  motivacion: string;
  tecnologia: string;
};

const questions = [
  {
    id: "interes" as const,
    label: "Interés Principal",
    options: ["ambos", "salud", "aparienia"],
  },
  {
    id: "ejercicio" as const,
    label: "Nivel de Ejercicio Actual",
    options: ["sedentario", "activo", "moderado"],
  },
  {
    id: "motivacion" as const,
    label: "Qué tan Motivado",
    options: ["moderado", "aggresivo"],
  },
  {
    id: "tecnologia" as const,
    label: "¿Cómodo con Dispositivos Tecnológicos?",
    options: ["si", "no"],
  },
];

const emptyForm: FormFields = {
  interes: "",
  ejercicio: "",
  motivacion: "",
  tecnologia: "",
};

type EstadoApp =
  | { fase: "formulario" }
  | { fase: "cargando" }
  | {
      fase: "resultado";
      id: number;
      prediccion: string;
      probI100: number;
      probI500: number;
    }
  | { fase: "error"; mensaje: string };

export default function Home() {
  const [form, setForm] = useState<FormFields>(emptyForm);
  const [estado, setEstado] = useState<EstadoApp>({ fase: "formulario" });
  const [sugerencia, setSugerencia] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [confirmacion, setConfirmacion] = useState("");

  function handleChange(id: keyof FormFields, value: string) {
    setForm((prev) => ({ ...prev, [id]: value }));
  }

  function handleClear() {
    setForm(emptyForm);
    setEstado({ fase: "formulario" });
    setSugerencia("");
    setConfirmacion("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setConfirmacion("");
    setEstado({ fase: "cargando" });

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interesPrincipal: form.interes,
          nivelEjercicio: form.ejercicio,
          queTanMotivado: form.motivacion,
          comodoDispositivos: form.tecnologia,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al predecir");
      }

      const data = await res.json();
      setEstado({
        fase: "resultado",
        id: data.id,
        prediccion: data.prediccion,
        probI100: data.probabilidadI100,
        probI500: data.probabilidadI500,
      });
    } catch (err) {
      setEstado({
        fase: "error",
        mensaje: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  }

  async function handleGuardarSugerencia() {
    if (estado.fase !== "resultado" || !sugerencia.trim()) return;
    setGuardando(true);

    try {
      const res = await fetch(`/api/predict/${estado.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userSuggestion: sugerencia }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      setConfirmacion("Sugerencia guardada correctamente.");
      setSugerencia("");
    } catch (err) {
      setConfirmacion(
        "Error al guardar: " + (err instanceof Error ? err.message : "desconocido"),
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg"
      >
        <h1 className="mb-8 text-center text-2xl font-bold text-zinc-800">
          Formulario de Preferencias
        </h1>

        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id}>
              <label
                htmlFor={q.id}
                className="mb-1 block text-sm font-medium text-zinc-700"
              >
                {q.label}
              </label>
              <select
                id={q.id}
                value={form[q.id]}
                onChange={(e) => handleChange(q.id, e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              >
                <option value="">Seleccionar...</option>
                {q.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* ──────────── Botones ──────────── */}
        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            disabled={estado.fase === "cargando"}
            className="flex-1 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {estado.fase === "cargando" ? "Procesando..." : "Predecir"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            Limpiar
          </button>
        </div>

        {/* ──────────── Resultado ──────────── */}
        {estado.fase === "resultado" && (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
              <p className="text-sm text-blue-700">Recomendación</p>
              <p className="text-2xl font-bold text-blue-900">
                {estado.prediccion}
              </p>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>i100</span>
                  <span>{(estado.probI100 * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-200">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${estado.probI100 * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>i500</span>
                  <span>{(estado.probI500 * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-200">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${estado.probI500 * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* ──────────── Sugerencia ──────────── */}
            <div className="border-t pt-4">
              <label
                htmlFor="sugerencia"
                className="mb-1 block text-sm font-medium text-zinc-700"
              >
                ¿Qué opinas de esta recomendación?
              </label>
              <textarea
                id="sugerencia"
                value={sugerencia}
                onChange={(e) => setSugerencia(e.target.value)}
                rows={3}
                placeholder="Escribe tu opinión o sugerencia..."
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleGuardarSugerencia}
                disabled={guardando || !sugerencia.trim()}
                className="mt-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Enviar Sugerencia"}
              </button>
              {confirmacion && (
                <p className="mt-2 text-sm text-green-700">{confirmacion}</p>
              )}
            </div>
          </div>
        )}

        {/* ──────────── Error ──────────── */}
        {estado.fase === "error" && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{estado.mensaje}</p>
          </div>
        )}
      </form>
    </div>
  );
}
