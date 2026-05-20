import { NextRequest } from "next/server";
import { predecir } from "@/utils/naiveBayes";
import { prisma } from "@/utils/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interesPrincipal, nivelEjercicio, queTanMotivado, comodoDispositivos } = body;

    if (!interesPrincipal || !nivelEjercicio || !queTanMotivado || !comodoDispositivos) {
      return Response.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 },
      );
    }

    const resultado = predecir({
      interesPrincipal,
      nivelEjercicio,
      queTanMotivado,
      comodoDispositivos,
    });

    const registro = await prisma.prediction.create({
      data: {
        interesPrincipal,
        nivelEjercicio,
        queTanMotivado,
        comodoDispositivos,
        prediccion: resultado.prediccion,
      },
    });

    return Response.json({
      id: registro.id,
      prediccion: resultado.prediccion,
      probabilidadI100: resultado.probabilidadI100,
      probabilidadI500: resultado.probabilidadI500,
    });
  } catch (error) {
    return Response.json(
      { error: "Error al procesar la predicción", details: String(error) },
      { status: 500 },
    );
  }
}
