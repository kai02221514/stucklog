import "server-only";

import mysql, { type Pool } from "mysql2/promise";

declare global {
  var stucklogPool: Pool | undefined;
}

const requiredVariables = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"] as const;

function getConnectionOptions() {
  const missing = requiredVariables.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(
      `RDS接続設定が不足しています: ${missing.join(", ")}。.env.exampleを参照してください。`,
    );
  }

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? "3306"),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    charset: "utf8mb4",
    timezone: "Z",
    connectionLimit: 10,
    enableKeepAlive: true,
  };
}

export function getPool() {
  if (!globalThis.stucklogPool) {
    globalThis.stucklogPool = mysql.createPool(getConnectionOptions());
  }

  return globalThis.stucklogPool;
}
