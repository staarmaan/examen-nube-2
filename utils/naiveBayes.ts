/* ================================================================
 *  MODELO: Naive Bayes Categórico con Estimador de Laplace
 *  Asignatura: Implementación Manual de Machine Learning
 *  Basado en el ejercicio "iHealth" (modelos i100 e i500)
 *
 *  Fórmula del PDF (Laplace Smoothing):
 *
 *    P(x_i | C_k) = (count(x_i, C_k) + 1) / (total(C_k) + N_i)
 *
 *    donde:
 *      count(x_i, C_k) = frecuencia de x_i en clase C_k
 *      total(C_k)      = total de instancias de la clase C_k
 *      N_i             = número de valores posibles de la i-ésima característica
 *
 *    P(C_k | X) ∝ P(C_k) * Π_i P(x_i | C_k)
 *
 *    P(C_k) = total(C_k) / total_general  (Prior)
 * ================================================================ */

/* ──────────────────────────────────────────────
 * 1. FRECUENCIAS HARDCODEADAS (Matriz del PDF, pág. 13)
 *    count(x_i, C_k) para cada característica y clase
 * ────────────────────────────────────────────── */

type Clase = "i100" | "i500";

type FrecuenciasCaracteristica = Record<string, Record<Clase, number>>;

interface Frecuencias {
  CTD: FrecuenciasCaracteristica; // Comfortable with tech Devices?  [N=2]
  HM: FrecuenciasCaracteristica;  // How Motivated                   [N=2]
  CEL: FrecuenciasCaracteristica; // Current Exercise Level          [N=3]
  MI: FrecuenciasCaracteristica;  // Main Interest                   [N=3]
}

const frecuencias: Frecuencias = {
  CTD: {
    yes: { i100: 2, i500: 6 },
    no: { i100: 4, i500: 3 },
  },
  HM: {
    moderate: { i100: 5, i500: 3 },
    aggressive: { i100: 1, i500: 6 },
  },
  CEL: {
    sedentary: { i100: 3, i500: 2 },
    active: { i100: 2, i500: 4 },
    moderate: { i100: 1, i500: 3 },
  },
  MI: {
    health: { i100: 1, i500: 4 },
    appearance: { i100: 2, i500: 3 },
    both: { i100: 3, i500: 2 },
  },
};

/* ──────────────────────────────────────────────
 * 2. TOTALES DE CLASE
 *    total(i100) = 6 , total(i500) = 9 , total = 15
 * ────────────────────────────────────────────── */

const TOTALES: Record<Clase, number> = { i100: 6, i500: 9 };
const TOTAL_GLOBAL = 15;

/* ──────────────────────────────────────────────
 * 3. CANTIDAD DE VALORES POSIBLES POR CARACTERÍSTICA (N_i)
 *    MI: 3, CEL: 3, HM: 2, CTD: 2
 * ────────────────────────────────────────────── */

const N_VALORES: Record<keyof Frecuencias, number> = {
  CTD: 2,
  HM: 2,
  CEL: 3,
  MI: 3,
};

/* ──────────────────────────────────────────────
 * 4. PRIOR: P(C_k) = total(C_k) / total_general
 * ────────────────────────────────────────────── */

function prior(clase: Clase): number {
  return TOTALES[clase] / TOTAL_GLOBAL;
}

/* ──────────────────────────────────────────────
 * 5. LIKELIHOOD con Laplace:
 *    P(x_i | C_k) = (count(x_i, C_k) + 1) / (total(C_k) + N_i)
 * ────────────────────────────────────────────── */

function likelihood(
  caracteristica: keyof Frecuencias,
  valor: string,
  clase: Clase,
): number {
  const frecuencia = frecuencias[caracteristica][valor]?.[clase];
  if (frecuencia === undefined) {
    throw new Error(
      `Valor "${valor}" no encontrado en característica "${caracteristica}"`,
    );
  }
  return (frecuencia + 1) / (TOTALES[clase] + N_VALORES[caracteristica]);
}

/* ──────────────────────────────────────────────
 * 6. POSTERIOR (no normalizada):
 *    P(C_k | X) ∝ P(C_k) * Π_i P(x_i | C_k)
 * ────────────────────────────────────────────── */

function posteriorNoNormalizada(
  clase: Clase,
  valores: Record<keyof Frecuencias, string>,
): number {
  let prob = prior(clase);
  for (const [caracteristica, valor] of Object.entries(valores)) {
    prob *= likelihood(caracteristica as keyof Frecuencias, valor, clase);
  }
  return prob;
}

/* ──────────────────────────────────────────────
 * 7. MAPEO ESPAÑOL → INGLÉS
 * ────────────────────────────────────────────── */

const MAPA_ESPANOL_INGLES: Record<string, Record<string, string>> = {
  interesPrincipal: {
    ambos: "both",
    salud: "health",
    aparienia: "appearance",
  },
  nivelEjercicio: {
    sedentario: "sedentary",
    activo: "active",
    moderado: "moderate",
  },
  queTanMotivado: {
    moderado: "moderate",
    aggresivo: "aggressive",
  },
  comodoDispositivos: {
    si: "yes",
    no: "no",
  },
};

export function mapearEspañolAIngles(
  campo: string,
  valorEspanol: string,
): string {
  return MAPA_ESPANOL_INGLES[campo]?.[valorEspanol] ?? valorEspanol;
}

/* ──────────────────────────────────────────────
 * 8. FUNCIÓN PRINCIPAL DE PREDICCIÓN
 *    Recibe las 4 respuestas en español y retorna
 *    la clase con mayor probabilidad posterior
 * ────────────────────────────────────────────── */

export interface InputUsuario {
  interesPrincipal: string;
  nivelEjercicio: string;
  queTanMotivado: string;
  comodoDispositivos: string;
}

export interface ResultadoPrediccion {
  prediccion: "i100" | "i500";
  probabilidadI100: number;
  probabilidadI500: number;
  evidencia: number;
}

export function predecir(input: InputUsuario): ResultadoPrediccion {
  const valores: Record<keyof Frecuencias, string> = {
    MI: mapearEspañolAIngles("interesPrincipal", input.interesPrincipal),
    CEL: mapearEspañolAIngles("nivelEjercicio", input.nivelEjercicio),
    HM: mapearEspañolAIngles("queTanMotivado", input.queTanMotivado),
    CTD: mapearEspañolAIngles("comodoDispositivos", input.comodoDispositivos),
  };

  const probI100 = posteriorNoNormalizada("i100", valores);
  const probI500 = posteriorNoNormalizada("i500", valores);

  const evidencia = probI100 + probI500;

  return {
    prediccion: probI100 >= probI500 ? "i100" : "i500",
    probabilidadI100: probI100 / evidencia,
    probabilidadI500: probI500 / evidencia,
    evidencia,
  };
}
