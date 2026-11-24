import Componente from "../entities/Componente.js";
import ComponenteModel from "../models/ComponenteModel.js";
import CategoriaModel from "../models/CategoriaModel.js";
import { ErrorApi, validarOError } from "../utils/errores.js";
import { responderError, idDeRequest, validarId } from "../utils/respuestas.js";

const armarComponente = (id, body, actual = null) => {
  const valor = (campo, defecto = null) =>
    body?.[campo] !== undefined ? body[campo] : actual?.[campo] ?? defecto;

  return new Componente(
    id,
    valor("categoria_id", actual?.categoria_id),
    valor("nombre", actual?.nombre),
    valor("marca", actual?.marca),
    valor("modelo", actual?.modelo),
    valor("precio", actual?.precio),
    valor("stock", actual?.stock),
    valor("descripcion", actual?.descripcion),
    valor("activo", actual?.activo ?? 1)
  );
};

const verificarCategoria = async (id) => {
  if (!(await CategoriaModel.obtenerPorId(id))) {
    throw new ErrorApi(`No existe una categoría con id ${id}.`, 404);
  }
};

const consultar = async (req, res) => {
  try {
    const idCrudo = req.query.id ?? req.params.id;
    if (idCrudo !== undefined) {
      const id = validarId(idCrudo);
      const componente = await ComponenteModel.obtenerPorId(id);
      if (!componente) throw new ErrorApi(`No se encontró un componente con id ${id}.`, 404);
      return res.json({ mensaje: "Consulta de componente.", data: componente });
    }
    const filtros = {};
    if (req.query.categoria_id) filtros.categoria_id = validarId(req.query.categoria_id);
    if (req.query.q) filtros.q = String(req.query.q).trim();
    return res.json({
      mensaje: "Consulta de componentes.",
      data: await ComponenteModel.obtenerTodos(filtros),
    });
  } catch (error) {
    return responderError(error, res, "consultar componentes");
  }
};

const ingresar = async (req, res) => {
  try {
    const componente = armarComponente(null, req.body);
    validarOError(componente);
    await verificarCategoria(componente.categoria_id);
    const guardado = await ComponenteModel.crear(componente);
    return res.status(201).json({ mensaje: "Componente creado.", data: guardado });
  } catch (error) {
    return responderError(error, res, "crear el componente");
  }
};

const actualizar = async (req, res) => {
  try {
    const id = validarId(idDeRequest(req));
    const actual = await ComponenteModel.obtenerPorId(id);
    if (!actual) throw new ErrorApi(`No se encontró un componente con id ${id}.`, 404);

    const componente = armarComponente(id, req.body, actual);
    validarOError(componente);
    await verificarCategoria(componente.categoria_id);

    return res.json({
      mensaje: "Componente modificado.",
      data: await ComponenteModel.actualizar(id, componente),
    });
  } catch (error) {
    return responderError(error, res, "modificar el componente");
  }
};

const borrar = async (req, res) => {
  try {
    const id = validarId(idDeRequest(req));
    if (!(await ComponenteModel.eliminar(id))) {
      throw new ErrorApi(`No se encontró un componente con id ${id}.`, 404);
    }
    return res.json({ mensaje: "Componente eliminado." });
  } catch (error) {
    return responderError(error, res, "eliminar el componente");
  }
};

export default { consultar, ingresar, actualizar, borrar };
