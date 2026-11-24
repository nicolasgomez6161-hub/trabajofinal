import express from "express";
import categoriasController from "../controllers/categoriasController.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Lectura pública; alta, modificación y baja requieren sesión (token Bearer).
router.get("/listar", categoriasController.consultar);
router.post("/alta", verificarToken, categoriasController.ingresar);
router.put("/modificar", verificarToken, categoriasController.actualizar);
router.delete("/eliminar/:id", verificarToken, categoriasController.borrar);

export default router;
