// Registro e inicio de sesión. Las contraseñas se guardan con hash bcrypt
// y nunca se devuelven en las respuestas (Usuario.toJSON las oculta).
import bcrypt from "bcryptjs";
import Usuario from "../entities/Usuario.js";
import UsuarioModel from "../models/UsuarioModel.js";
import { generarToken } from "../middleware/authMiddleware.js";
import { ErrorApi, validarOError } from "../utils/errores.js";
import { responderError } from "../utils/respuestas.js";
import { emailValido, textoRequerido } from "../middleware/validacion.js";

const registro = async (req, res) => {
  try {
    const { nombre, email, password, password_confirmacion } = req.body ?? {};

    if (password !== password_confirmacion) {
      throw new ErrorApi("Las contraseñas no coinciden.", 400);
    }

    // El registro público siempre crea vendedores; el admin se crea en el SQL.
    const usuario = new Usuario(null, nombre, email, password, "vendedor");
    validarOError(usuario);

    if (await UsuarioModel.obtenerPorEmail(usuario.email)) {
      throw new ErrorApi("Ya existe un usuario con ese email.", 400);
    }

    usuario.password = await bcrypt.hash(password, 10);
    const guardado = await UsuarioModel.crear(usuario);

    return res.status(201).json({
      mensaje: "Usuario registrado correctamente.",
      data: guardado,
    });
  } catch (error) {
    return responderError(error, res, "registrar el usuario");
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    const emailValidado = emailValido(email);
    textoRequerido(password, "password");

    const usuario = await UsuarioModel.obtenerPorEmail(emailValidado);
    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res.status(401).json({
        mensaje: "Credenciales inválidas.",
        detalle: "Email o contraseña incorrectos.",
      });
    }

    const token = generarToken({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    });

    return res.json({
      mensaje: "Login exitoso.",
      token,
      tipo: "Bearer",
      expiraEn: process.env.JWT_EXPIRES_IN || "2h",
      usuario: usuario.toJSON(),
    });
  } catch (error) {
    return responderError(error, res, "iniciar sesión");
  }
};

const verificar = (req, res) =>
  res.json({ mensaje: "Token válido.", usuario: req.usuario });

const perfil = async (req, res) => {
  try {
    const usuario = await UsuarioModel.obtenerPorId(req.usuario.id);
    if (!usuario) throw new ErrorApi("No se encontró el usuario del token.", 404);
    return res.json({ mensaje: "Perfil del usuario.", data: usuario });
  } catch (error) {
    return responderError(error, res, "consultar el perfil");
  }
};

const info = (req, res) =>
  res.json({
    mensaje: "Autenticación - API Tienda Gamer",
    registro: "POST /auth/registro { nombre, email, password, password_confirmacion }",
    login: "POST /auth/login { email, password }",
    uso: "Enviar Authorization: Bearer <token> en las rutas de alta, modificación y baja.",
    credencialesDePrueba: { email: "admin@tiendagamer.test", password: "admin123" },
  });

export default { registro, login, verificar, perfil, info };
