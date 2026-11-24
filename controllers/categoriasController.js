import Categoria from "../entities/Categoria.js";
import CategoriaModel from "../models/CategoriaModel.js";
import { ErrorApi, validarOError } from "../utils/errores.js";
import { responderError, idDeRequest, validarId } from "../utils/respuestas.js";
import { textoOpcional } from "../middleware/validacion.js";

const consultar = async (req, res) => {
  try {
    const idCrudo = idDeRequest(req);
    if (idCrudo !== undefined) {
      const id = validarId(idCrudo);
      const categoria = await CategoriaModel.obtenerPorId(id);
      if (!categoria) throw new ErrorApi(`No se encontró una categoría con id ${id}.`, 404);
      return res.json({ mensaje: "Consulta de categoría.", data: categoria });
    }
    return res.json({ mensaje: "Consulta de categorías.", data: await CategoriaModel.obtenerTodos() });
  } catch (error) {
    return responderError(error, res, "consultar categorías");
  }
};

const ingresar = async (req, res) => {
  try {
    const categoria = new Categoria(null, req.body?.nombre, req.body?.descripcion);
    validarOError(categoria);
    const guardada = await CategoriaModel.crear(categoria);
    return res.status(201).json({ mensaje: "Categoría creada.", data: guardada });
  } catch (error) {
    return responderError(error, res, "crear la categoría");
  }
};

const actualizar = async (req, res) => {
  try {
    const id = validarId(idDeRequest(req));
    const actual = await CategoriaModel.obtenerPorId(id);
    if (!actual) throw new ErrorApi(`No se encontró una categoría con id ${id}.`, 404);

    const nombre = req.body?.nombre !== undefined ? req.body.nombre : actual.nombre;
    const descripcion =
      req.body?.descripcion !== undefined
        ? textoOpcional(req.body.descripcion, "descripcion", 255)
        : actual.descripcion;

    const categoria = new Categoria(id, nombre, descripcion);
    validarOError(categoria);
    return res.json({ mensaje: "Categoría modificada.", data: await CategoriaModel.actualizar(id, categoria) });
  } catch (error) {
    return responderError(error, res, "modificar la categoría");
  }
};

const borrar = async (req, res) => {
  try {
    const id = validarId(idDeRequest(req));
    if (!(await CategoriaModel.eliminar(id))) {
      throw new ErrorApi(`No se encontró una categoría con id ${id}.`, 404);
    }
    return res.json({ mensaje: "Categoría eliminada." });
  } catch (error) {
    return responderError(error, res, "eliminar la categoría");
  }
};

export default { consultar, ingresar, actualizar, borrar };
