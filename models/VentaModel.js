import pool from "../config/conexion.js";
import Venta from "../entities/Venta.js";
import { ErrorApi } from "../utils/errores.js";

const obtenerDetalles = async (ventaId, conexion = pool) => {
  const [filas] = await conexion.execute(
    `SELECT dv.id, dv.componente_id, c.nombre AS componente_nombre,
            dv.cantidad, dv.precio_unitario, dv.subtotal
       FROM detalle_venta dv
       JOIN componentes c ON c.id = dv.componente_id
      WHERE dv.venta_id = ?
      ORDER BY dv.id`,
    [ventaId]
  );
  return filas;
};

const filaAVenta = (fila, detalles = []) =>
  new Venta(
    fila.id,
    fila.cliente_id,
    fila.usuario_id,
    fila.fecha,
    fila.total,
    fila.estado,
    fila.observaciones,
    detalles
  );

const obtenerTodos = async () => {
  const [filas] = await pool.execute(
    `SELECT v.*, CONCAT(cl.nombre, ' ', cl.apellido) AS cliente_nombre,
            u.nombre AS usuario_nombre
       FROM ventas v
       JOIN clientes cl ON cl.id = v.cliente_id
       JOIN usuarios u ON u.id = v.usuario_id
      ORDER BY v.id DESC`
  );

  const ventas = [];
  for (const fila of filas) {
    const detalles = await obtenerDetalles(fila.id);
    ventas.push({
      ...filaAVenta(fila, detalles).toJSON(),
      cliente_nombre: fila.cliente_nombre,
      usuario_nombre: fila.usuario_nombre,
    });
  }
  return ventas;
};

const obtenerPorId = async (id, conexion = pool) => {
  const [filas] = await conexion.execute(
    `SELECT v.*, CONCAT(cl.nombre, ' ', cl.apellido) AS cliente_nombre,
            u.nombre AS usuario_nombre
       FROM ventas v
       JOIN clientes cl ON cl.id = v.cliente_id
       JOIN usuarios u ON u.id = v.usuario_id
      WHERE v.id = ?`,
    [id]
  );
  if (!filas.length) return null;
  const detalles = await obtenerDetalles(id, conexion);
  return {
    ...filaAVenta(filas[0], detalles).toJSON(),
    cliente_nombre: filas[0].cliente_nombre,
    usuario_nombre: filas[0].usuario_nombre,
  };
};

// Operación transaccional: valida stock, inserta cabecera + detalles y descuenta stock.
const crearConDetalles = async (datos, conexion) => {
  const { clienteId, usuarioId, items, observaciones } = datos;
  let total = 0;
  const detallesParaInsertar = [];

  for (const item of items) {
    const [componentes] = await conexion.execute(
      "SELECT id, nombre, precio, stock FROM componentes WHERE id = ? FOR UPDATE",
      [item.componente_id]
    );

    if (!componentes.length) {
      throw new ErrorApi(`No existe un componente con id ${item.componente_id}.`, 404);
    }

    const componente = componentes[0];
    if (Number(componente.stock) < item.cantidad) {
      throw new ErrorApi(
        `Stock insuficiente para ${componente.nombre}. Disponible: ${componente.stock}.`,
        400
      );
    }

    const subtotal = Number(componente.precio) * item.cantidad;
    total += subtotal;
    detallesParaInsertar.push({
      componente_id: componente.id,
      cantidad: item.cantidad,
      precio_unitario: Number(componente.precio),
      subtotal,
    });
  }

  const [resultado] = await conexion.execute(
    `INSERT INTO ventas (cliente_id, usuario_id, total, estado, observaciones)
     VALUES (?, ?, ?, 'confirmada', ?)`,
    [clienteId, usuarioId, total, observaciones]
  );
  const ventaId = resultado.insertId;

  for (const detalle of detallesParaInsertar) {
    await conexion.execute(
      `INSERT INTO detalle_venta
         (venta_id, componente_id, cantidad, precio_unitario, subtotal)
       VALUES (?, ?, ?, ?, ?)`,
      [ventaId, detalle.componente_id, detalle.cantidad, detalle.precio_unitario, detalle.subtotal]
    );
    await conexion.execute(
      "UPDATE componentes SET stock = stock - ? WHERE id = ?",
      [detalle.cantidad, detalle.componente_id]
    );
  }

  return obtenerPorId(ventaId, conexion);
};

const actualizar = async (id, estado, observaciones) => {
  await pool.execute(
    "UPDATE ventas SET estado = ?, observaciones = ? WHERE id = ?",
    [estado, observaciones, id]
  );
  return obtenerPorId(id);
};

// Borra la venta y devuelve el stock de cada componente (todo en la misma transacción).
const eliminarConDetalles = async (id, conexion) => {
  const venta = await obtenerPorId(id, conexion);
  if (!venta) return false;

  for (const detalle of venta.detalles) {
    await conexion.execute(
      "UPDATE componentes SET stock = stock + ? WHERE id = ?",
      [detalle.cantidad, detalle.componente_id]
    );
  }
  await conexion.execute("DELETE FROM detalle_venta WHERE venta_id = ?", [id]);
  await conexion.execute("DELETE FROM ventas WHERE id = ?", [id]);
  return true;
};

export default {
  obtenerTodos,
  obtenerPorId,
  crearConDetalles,
  actualizar,
  eliminarConDetalles,
};
