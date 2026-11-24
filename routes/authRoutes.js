import express from "express";
import authController from "../controllers/authController.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Públicas
router.post("/registro", authController.registro);
router.post("/login", authController.login);
router.get("/info", authController.info);

// Protegidas
router.get("/verificar", verificarToken, authController.verificar);
router.get("/perfil", verificarToken, authController.perfil);

export default router;
