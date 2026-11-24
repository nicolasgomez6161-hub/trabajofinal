// Error con código HTTP explícito para responder 400 / 404 desde cualquier capa.
export class ErrorApi extends Error {
  constructor(mensaje, codigo = 400) {
    super(mensaje);
    this.codigo = codigo;
  }
}

// Las entidades lanzan Error de validación; lo convertimos a ErrorApi(400).
export const validarOError = (entidad) => {
  try {
    entidad.validar();
  } catch (error) {
    throw new ErrorApi(error.message, 400);
  }
};
