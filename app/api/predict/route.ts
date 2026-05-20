import { NextRequest } from "next/server";
import type mysql from "mysql2";
import { predecir } from "@/utils/naiveBayes";
import { pool } from "@/utils/db";

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

    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        `INSERT INTO Prediction (interesPrincipal, nivelEjercicio, queTanMotivado, comodoDispositivos, prediccion)
         VALUES (?, ?, ?, ?, ?)`,
        [
          interesPrincipal,
          nivelEjercicio,
          queTanMotivado,
          comodoDispositivos,
          resultado.prediccion,
        ],
      );
      const insertId = (result as mysql.ResultSetHeader).insertId;

      return Response.json({
        id: insertId,
        prediccion: resultado.prediccion,
        probabilidadI100: resultado.probabilidadI100,
        probabilidadI500: resultado.probabilidadI500,
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    return Response.json(
      { error: "Error al procesar la predicción", details: String(error) },
      { status: 500 },
    );
  }
}
