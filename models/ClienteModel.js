import pool from "../config/conexion.js";
import Cliente from "../entities/Cliente.js";

const filaACliente = (fila) =>
  new Cliente(
    fila.id,
    fila.nombre,
    fila.apellido,
    fila.email,
    fila.telefono,
    fila.direccion
  );

const obtenerTodos = async (q = null) => {
  if (q) {
    const like = `%${q}%`;
    const [filas] = await pool.execute(
      `SELECT * FROM clientes
        WHERE nombre LIKE ? OR apellido LIKE ? OR email LIKE ?
        ORDER BY id`,
      [like, like, like]
    );
    return filas.map(filaACliente);
  }
  const [filas] = await pool.execute("SELECT * FROM clientes ORDER BY id");
  return filas.map(filaACliente);
};

const obtenerPorId = async (id) => {
  const [filas] = await pool.execute("SELECT * FROM clientes WHERE id = ?", [id]);
  return filas.length ? filaACliente(filas[0]) : null;
};

const crear = async (cliente) => {
  const [resultado] = await pool.execute(
    `INSERT INTO clientes (nombre, apellido, email, telefono, direccion)
     VALUES (?, ?, ?, ?, ?)`,
    [cliente.nombre, cliente.apellido, cliente.email, cliente.telefono, cliente.direccion]
  );
  return obtenerPorId(resultado.insertId);
};

const actualizar = async (id, cliente) => {
  await pool.execute(
    `UPDATE clientes
        SET nombre = ?, apellido = ?, email = ?, telefono = ?, direccion = ?
      WHERE id = ?`,
    [cliente.nombre, cliente.apellido, cliente.email, cliente.telefono, cliente.direccion, id]
  );
  return obtenerPorId(id);
};

const eliminar = async (id) => {
  const [resultado] = await pool.execute("DELETE FROM clientes WHERE id = ?", [id]);
  return resultado.affectedRows > 0;
};

export default { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };
