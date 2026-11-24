import { ErrorApi } from "./errores.js";
import { responderErrorDB, idValido } from "../middleware/validacion.js";

export const responderError = (error, res, contexto) => {
  if (error instanceof ErrorApi) {
    return res.status(error.codigo).json({ mensaje: error.message });
  }
  return responderErrorDB(error, res, contexto);
};

// El id puede venir en :id (DELETE), ?id= (GET) o en el body (PUT).
export const idDeRequest = (req) => req.params.id ?? req.query.id ?? req.body?.id;

export const validarId = (id) => {
  if (!idValido(id)) {
    throw new ErrorApi("El id debe ser un número entero positivo.", 400);
  }
  return Number(id);
};
