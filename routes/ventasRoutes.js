import express from "express";
import ventasController from "../controllers/ventasController.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/listar", ventasController.consultar);
router.post("/alta", verificarToken, ventasController.ingresar);
router.put("/modificar", verificarToken, ventasController.actualizar);
router.delete("/eliminar/:id", verificarToken, ventasController.borrar);

export default router;
