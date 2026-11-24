import express from "express";
import componentesController from "../controllers/componentesController.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/listar", componentesController.consultar);
router.post("/alta", verificarToken, componentesController.ingresar);
router.put("/modificar", verificarToken, componentesController.actualizar);
router.delete("/eliminar/:id", verificarToken, componentesController.borrar);

export default router;
