// Ventas: la alta y la baja son transaccionales para no romper el stock
// ni dejar detalles huérfanos si algo falla a mitad de camino.
import pool from "../config/conexion.js";
import VentaModel from "../models/VentaModel.js";
import ClienteModel from "../models/ClienteModel.js";
import UsuarioModel from "../models/UsuarioModel.js";
import { ErrorApi } from "../utils/errores.js";
import { responderError, idDeRequest, validarId } from "../utils/respuestas.js";
import { textoOpcional } from "../middleware/validacion.js";

const conTransaccion = async (fn) => {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    const resultado = await fn(conexion);
    await conexion.commit();
    return resultado;
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
};

const consultar = async (req, res) => {
  try {
    const idCrudo = req.query.id ?? req.params.id;
    if (idCrudo !== undefined) {
      const id = validarId(idCrudo);
      const venta = await VentaModel.obtenerPorId(id);
      if (!venta) throw new ErrorApi(`No se encontró una venta con id ${id}.`, 404);
      return res.json({ mensaje: "Consulta de venta.", data: venta });
    }
    return res.json({ mensaje: "Consulta de ventas.", data: await VentaModel.obtenerTodos() });
  } catch (error) {
    return responderError(error, res, "consultar ventas");
  }
};

const ingresar = async (req, res) => {
  try {
    const clienteId = validarId(req.body?.cliente_id);
    const items = req.body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      throw new ErrorApi("items debe ser un array con al menos un componente.", 400);
    }

    // Sumamos cantidades repetidas para no violar el único (venta_id, componente_id).
    const agrupados = new Map();
    for (const item of items) {
      const componenteId = validarId(item?.componente_id);
      const cantidad = Number(item?.cantidad);
      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        throw new ErrorApi("cantidad debe ser un entero positivo.", 400);
      }
      agrupados.set(componenteId, (agrupados.get(componenteId) || 0) + cantidad);
    }
    const itemsValidados = Array.from(agrupados, ([componente_id, cantidad]) => ({ componente_id, cantidad }));

    if (!(await ClienteModel.obtenerPorId(clienteId))) {
      throw new ErrorApi(`No existe un cliente con id ${clienteId}.`, 404);
    }
    if (!(await UsuarioModel.obtenerPorId(req.usuario.id))) {
      throw new ErrorApi("No existe el usuario del token.", 404);
    }

    const observaciones = textoOpcional(req.body?.observaciones, "observaciones", 500);
    const venta = await conTransaccion((conexion) =>
      VentaModel.crearConDetalles(
        { clienteId, usuarioId: req.usuario.id, items: itemsValidados, observaciones },
        conexion
      )
    );

    return res.status(201).json({ mensaje: "Venta registrada.", data: venta });
  } catch (error) {
    return responderError(error, res, "registrar la venta");
  }
};

const actualizar = async (req, res) => {
  try {
    const id = validarId(idDeRequest(req));
    const actual = await VentaModel.obtenerPorId(id);
    if (!actual) throw new ErrorApi(`No se encontró una venta con id ${id}.`, 404);

    const estado = req.body?.estado !== undefined ? req.body.estado : actual.estado;
    if (!["pendiente", "confirmada", "anulada"].includes(estado)) {
      throw new ErrorApi("estado debe ser pendiente, confirmada o anulada.", 400);
    }
    const observaciones =
      req.body?.observaciones !== undefined
        ? textoOpcional(req.body.observaciones, "observaciones", 500)
        : actual.observaciones;

    return res.json({
      mensaje: "Venta modificada.",
      data: await VentaModel.actualizar(id, estado, observaciones),
    });
  } catch (error) {
    return responderError(error, res, "modificar la venta");
  }
};

const borrar = async (req, res) => {
  try {
    const id = validarId(idDeRequest(req));
    const eliminada = await conTransaccion((conexion) =>
      VentaModel.eliminarConDetalles(id, conexion)
    );
    if (!eliminada) throw new ErrorApi(`No se encontró una venta con id ${id}.`, 404);
    return res.json({ mensaje: "Venta eliminada y stock restaurado." });
  } catch (error) {
    return responderError(error, res, "eliminar la venta");
  }
};

export default { consultar, ingresar, actualizar, borrar };
