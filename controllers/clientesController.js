import Cliente from "../entities/Cliente.js";
import ClienteModel from "../models/ClienteModel.js";
import { ErrorApi, validarOError } from "../utils/errores.js";
import { responderError, idDeRequest, validarId } from "../utils/respuestas.js";
import { textoOpcional } from "../middleware/validacion.js";

const armarCliente = (id, body, actual = null) => {
  const valor = (campo) => (body?.[campo] !== undefined ? body[campo] : actual?.[campo]);
  return new Cliente(
    id,
    valor("nombre"),
    valor("apellido"),
    valor("email"),
    valor("telefono"),
    valor("direccion")
  );
};

const consultar = async (req, res) => {
  try {
    const idCrudo = idDeRequest(req);
    if (idCrudo !== undefined) {
      const id = validarId(idCrudo);
      const cliente = await ClienteModel.obtenerPorId(id);
      if (!cliente) throw new ErrorApi(`No se encontró un cliente con id ${id}.`, 404);
      return res.json({ mensaje: "Consulta de cliente.", data: cliente });
    }
    const q = req.query.q ? String(req.query.q).trim() : null;
    return res.json({ mensaje: "Consulta de clientes.", data: await ClienteModel.obtenerTodos(q) });
  } catch (error) {
    return responderError(error, res, "consultar clientes");
  }
};

const ingresar = async (req, res) => {
  try {
    const cliente = armarCliente(null, req.body);
    validarOError(cliente);
    cliente.telefono = textoOpcional(cliente.telefono, "telefono", 30);
    cliente.direccion = textoOpcional(cliente.direccion, "direccion", 200);
    const guardado = await ClienteModel.crear(cliente);
    return res.status(201).json({ mensaje: "Cliente creado.", data: guardado });
  } catch (error) {
    return responderError(error, res, "crear el cliente");
  }
};

const actualizar = async (req, res) => {
  try {
    const id = validarId(idDeRequest(req));
    const actual = await ClienteModel.obtenerPorId(id);
    if (!actual) throw new ErrorApi(`No se encontró un cliente con id ${id}.`, 404);

    const cliente = armarCliente(id, req.body, actual);
    validarOError(cliente);
    cliente.telefono = textoOpcional(cliente.telefono, "telefono", 30);
    cliente.direccion = textoOpcional(cliente.direccion, "direccion", 200);

    return res.json({ mensaje: "Cliente modificado.", data: await ClienteModel.actualizar(id, cliente) });
  } catch (error) {
    return responderError(error, res, "modificar el cliente");
  }
};

const borrar = async (req, res) => {
  try {
    const id = validarId(idDeRequest(req));
    if (!(await ClienteModel.eliminar(id))) {
      throw new ErrorApi(`No se encontró un cliente con id ${id}.`, 404);
    }
    return res.json({ mensaje: "Cliente eliminado." });
  } catch (error) {
    return responderError(error, res, "eliminar el cliente");
  }
};

export default { consultar, ingresar, actualizar, borrar };
