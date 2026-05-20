import { pool } from "@/utils/db";

export async function GET() {
  try {
    const conn = await pool.getConnection();
    conn.release();
    return Response.json({ status: "✅ DB connection successful" });
  } catch (error) {
    return Response.json({ status: "❌ DB connection failed", error: error.message });
  }
}
