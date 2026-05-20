import { NextRequest } from "next/server";
import { prisma } from "@/utils/prisma";

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

    const registro = await prisma.prediction.update({
      where: { id: Number(id) },
      data: { userSuggestion },
    });

    return Response.json({ success: true, id: registro.id });
  } catch (error) {
    return Response.json(
      { error: "Error al guardar la sugerencia", details: String(error) },
      { status: 500 },
    );
  }
}
