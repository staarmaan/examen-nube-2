import { NextRequest } from "next/server";
import { pool } from "@/utils/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userSuggestion } = body;

    if (!userSuggestion) {
      return Response.json(
        { error: "userSuggestion es obligatorio" },
        { status: 400 },
      );
    }

    const conn = await pool.getConnection();
    try {
      await conn.execute(
        "UPDATE Prediction SET userSuggestion = ? WHERE id = ?",
        [userSuggestion, Number(id)],
      );
      return Response.json({ success: true, id: Number(id) });
    } finally {
      conn.release();
    }
  } catch (error) {
    return Response.json(
      { error: "Error al guardar la sugerencia", details: String(error) },
      { status: 500 },
    );
  }
}
