import express from "express";
import clientesController from "../controllers/clientesController.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/listar", clientesController.consultar);
router.post("/alta", verificarToken, clientesController.ingresar);
router.put("/modificar", verificarToken, clientesController.actualizar);
router.delete("/eliminar/:id", verificarToken, clientesController.borrar);

export default router;
