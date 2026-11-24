// Pool de conexiones a MySQL. Todas las consultas usan placeholders (?),
// nunca concatenamos valores del cliente dentro del SQL.
import mysql from "mysql2/promise";
import "dotenv/config";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tienda_gamer",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true, // DECIMAL llega como number, no como string
});

// Prueba rápida al arrancar (no detiene el servidor si MySQL está apagado).
try {
  const conexion = await pool.getConnection();
  console.log("Conectado a MySQL:", process.env.DB_NAME || "tienda_gamer");
  conexion.release();
} catch (error) {
  console.error("No se pudo conectar a MySQL:", error.message);
}

export default pool;
