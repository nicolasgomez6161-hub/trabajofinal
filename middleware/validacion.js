// Helpers de validación y de respuestas de error.
// Centralizamos los códigos HTTP para no repetirlos en cada controlador.
import { ErrorApi } from "../utils/errores.js";

export const idValido = (id) => {
  const numero = Number(id);
  return Number.isInteger(numero) && numero > 0;
};

export const textoRequerido = (valor, nombre, max = 255) => {
  if (typeof valor !== "string" || valor.trim() === "") {
    throw new ErrorApi(`${nombre} es obligatorio.`, 400);
  }
  if (valor.trim().length > max) {
    throw new ErrorApi(`${nombre} no puede superar los ${max} caracteres.`, 400);
  }
  return valor.trim();
};

export const textoOpcional = (valor, nombre, max = 255) => {
  if (valor === undefined || valor === null || valor === "") return null;
  if (typeof valor !== "string") throw new ErrorApi(`${nombre} debe ser texto.`, 400);
  if (valor.trim().length > max) {
    throw new ErrorApi(`${nombre} no puede superar los ${max} caracteres.`, 400);
  }
  return valor.trim();
};

export const numeroRequerido = (valor, nombre, minimo = 0) => {
  const numero = Number(valor);
  if (valor === undefined || valor === null || valor === "" || !Number.isFinite(numero)) {
    throw new ErrorApi(`${nombre} debe ser un número.`, 400);
  }
  if (numero < minimo) throw new ErrorApi(`${nombre} debe ser mayor o igual a ${minimo}.`, 400);
  return numero;
};

export const emailValido = (valor, nombre = "email") => {
  const email = textoRequerido(valor, nombre, 150);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ErrorApi(`${nombre} no tiene un formato válido.`, 400);
  }
  return email;
};

// Traduce errores de MySQL a códigos HTTP de la consigna (400 / 500).
export const responderErrorDB = (error, res, contexto) => {
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(400).json({
      mensaje: "Ya existe un registro con ese valor único.",
      detalle: error.sqlMessage,
    });
  }
  if (
    error.code === "ER_ROW_IS_REFERENCED_2" ||
    error.code === "ER_NO_REFERENCED_ROW_2" ||
    error.code === "ER_ROW_IS_REFERENCED" ||
    error.code === "ER_NO_REFERENCED_ROW"
  ) {
    return res.status(400).json({
      mensaje: "No se puede completar la operación por una relación con otra tabla.",
      detalle: error.sqlMessage,
    });
  }
  console.error(contexto, error);
  return res.status(500).json({
    mensaje: `Error interno al ${contexto}.`,
    error: error.message,
  });
};
