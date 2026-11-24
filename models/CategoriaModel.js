import pool from "../config/conexion.js";
import Categoria from "../entities/Categoria.js";

const filaACategoria = (fila) => new Categoria(fila.id, fila.nombre, fila.descripcion);

const obtenerTodos = async () => {
  const [filas] = await pool.execute("SELECT * FROM categorias ORDER BY id");
  return filas.map(filaACategoria);
};

const obtenerPorId = async (id) => {
  const [filas] = await pool.execute("SELECT * FROM categorias WHERE id = ?", [id]);
  return filas.length ? filaACategoria(filas[0]) : null;
};

const crear = async (categoria) => {
  const [resultado] = await pool.execute(
    "INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)",
    [categoria.nombre, categoria.descripcion]
  );
  return obtenerPorId(resultado.insertId);
};

const actualizar = async (id, categoria) => {
  await pool.execute(
    "UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?",
    [categoria.nombre, categoria.descripcion, id]
  );
  return obtenerPorId(id);
};

const eliminar = async (id) => {
  const [resultado] = await pool.execute("DELETE FROM categorias WHERE id = ?", [id]);
  return resultado.affectedRows > 0;
};

export default { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };
