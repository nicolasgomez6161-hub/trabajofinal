import pool from "../config/conexion.js";
import Usuario from "../entities/Usuario.js";

const filaAUsuario = (fila) =>
  new Usuario(fila.id, fila.nombre, fila.email, fila.password, fila.rol, fila.created_at);

const obtenerPorEmail = async (email) => {
  const [filas] = await pool.execute("SELECT * FROM usuarios WHERE email = ?", [email]);
  return filas.length ? filaAUsuario(filas[0]) : null;
};

const obtenerPorId = async (id) => {
  const [filas] = await pool.execute("SELECT * FROM usuarios WHERE id = ?", [id]);
  return filas.length ? filaAUsuario(filas[0]) : null;
};

const crear = async (usuario) => {
  const [resultado] = await pool.execute(
    "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)",
    [usuario.nombre, usuario.email, usuario.password, usuario.rol]
  );
  return obtenerPorId(resultado.insertId);
};

export default { obtenerPorEmail, obtenerPorId, crear };
