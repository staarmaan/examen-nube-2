import mysql from "mysql2/promise";

const globalForDb = globalThis as unknown as {
  pool: mysql.Pool | undefined;
};

function createPool(): mysql.Pool {
  const rawUrl = process.env.DATABASE_URL!;
  const match = rawUrl.match(/mysql:\/\/([^:]+):(.+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error("No se pudo parsear DATABASE_URL");
  }
  return mysql.createPool({
    host: match[3],
    port: Number(match[4]),
    user: match[1],
    password: match[2],
    database: match[5],
    waitForConnections: true,
    connectionLimit: 10,
    ssl: { rejectUnauthorized: false },
  });
}

export const pool = globalForDb.pool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}
