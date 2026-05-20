"use client";

import { useState } from "react";

type FormFields = {
  interes: string;
  ejercicio: string;
  motivacion: string;
  tecnologia: string;
};

/*
const questions = [
  { id: "interes" as const, label: "Interés Principal", options: ["both", "health", "appearance"] },
  { id: "ejercicio" as const, label: "Nivel de Ejercicio Actual", options: ["sedentary", "active", "moderate"] },
  { id: "motivacion" as const, label: "Qué tan Motivado", options: ["moderate", "aggressive"] },
  { id: "tecnologia" as const, label: "¿Cómodo con Dispositivos Tecnológicos?", options: ["yes", "no"] },
];
*/

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

export default function Home() {
  const [form, setForm] = useState<FormFields>(emptyForm);

  function handleChange(id: keyof FormFields, value: string) {
    setForm((prev) => ({ ...prev, [id]: value }));
  }

  function handleClear() {
    setForm(emptyForm);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-8">
      <form className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
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

        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            aceptar
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            limpiar
          </button>
        </div>
      </form>
    </div>
  );
}
