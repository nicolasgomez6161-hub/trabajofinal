// Autenticación Bearer con JWT. Las rutas de alta, modificación y baja
// pasan por verificarToken; el frontend guarda el token en localStorage.
import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET =
  process.env.JWT_SECRET || "clave_secreta_tienda_gamer_cambiar_en_produccion";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";

export const generarToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

export const verificarToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      mensaje: "Acceso denegado. Falta el token de autenticación.",
      detalle: "Incluí el header: Authorization: Bearer <token>",
      ayuda: "Primero hacé POST a /auth/login para obtener un token.",
    });
  }

  const partes = header.split(" ");
  if (partes.length !== 2 || partes[0] !== "Bearer" || !partes[1]) {
    return res.status(401).json({
      mensaje: "Formato de token inválido.",
      detalle: "El header debe ser exactamente: Authorization: Bearer <token>",
    });
  }

  try {
    req.usuario = jwt.verify(partes[1], JWT_SECRET);
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        mensaje: "Token expirado.",
        detalle: "Volvé a hacer login para obtener uno nuevo.",
      });
    }
    return res.status(401).json({
      mensaje: "Token inválido.",
      detalle: error.message,
    });
  }
};
