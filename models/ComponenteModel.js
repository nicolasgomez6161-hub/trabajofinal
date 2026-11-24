import pool from "../config/conexion.js";
import Componente from "../entities/Componente.js";

const filaAComponente = (fila) =>
  new Componente(
    fila.id,
    fila.categoria_id,
    fila.nombre,
    fila.marca,
    fila.modelo,
    fila.precio,
    fila.stock,
    fila.descripcion,
    fila.activo
  );

const obtenerTodos = async (filtros = {}) => {
  const condiciones = [];
  const valores = [];

  if (filtros.id) {
    condiciones.push("id = ?");
    valores.push(filtros.id);
  }
  if (filtros.categoria_id) {
    condiciones.push("categoria_id = ?");
    valores.push(filtros.categoria_id);
  }
  if (filtros.q) {
    const like = `%${filtros.q}%`;
    condiciones.push("(nombre LIKE ? OR marca LIKE ? OR modelo LIKE ?)");
    valores.push(like, like, like);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";
  const [filas] = await pool.execute(
    `SELECT c.*, cat.nombre AS categoria_nombre
       FROM componentes c
       JOIN categorias cat ON cat.id = c.categoria_id
       ${where}
      ORDER BY c.id`,
    valores
  );

  return filas.map((fila) => ({ ...filaAComponente(fila).toJSON(), categoria_nombre: fila.categoria_nombre }));
};

const obtenerPorId = async (id) => {
  const [filas] = await pool.execute(
    `SELECT c.*, cat.nombre AS categoria_nombre
       FROM componentes c
       JOIN categorias cat ON cat.id = c.categoria_id
      WHERE c.id = ?`,
    [id]
  );
  if (!filas.length) return null;
  return { ...filaAComponente(filas[0]).toJSON(), categoria_nombre: filas[0].categoria_nombre };
};

const crear = async (componente) => {
  const [resultado] = await pool.execute(
    `INSERT INTO componentes
       (categoria_id, nombre, marca, modelo, precio, stock, descripcion, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      componente.categoria_id,
      componente.nombre,
      componente.marca,
      componente.modelo,
      componente.precio,
      componente.stock,
      componente.descripcion,
      componente.activo,
    ]
  );
  return obtenerPorId(resultado.insertId);
};

const actualizar = async (id, componente) => {
  await pool.execute(
    `UPDATE componentes
        SET categoria_id = ?, nombre = ?, marca = ?, modelo = ?,
            precio = ?, stock = ?, descripcion = ?, activo = ?
      WHERE id = ?`,
    [
      componente.categoria_id,
      componente.nombre,
      componente.marca,
      componente.modelo,
      componente.precio,
      componente.stock,
      componente.descripcion,
      componente.activo,
      id,
    ]
  );
  return obtenerPorId(id);
};

const eliminar = async (id) => {
  const [resultado] = await pool.execute("DELETE FROM componentes WHERE id = ?", [id]);
  return resultado.affectedRows > 0;
};

export default { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };
