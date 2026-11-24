// Servidor Express: expone la API REST y sirve el frontend en /public.
import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/authRoutes.js";
import categoriasRoutes from "./routes/categoriasRoutes.js";
import componentesRoutes from "./routes/componentesRoutes.js";
import clientesRoutes from "./routes/clientesRoutes.js";
import ventasRoutes from "./routes/ventasRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
// index: false para que "/" responda el JSON de la API y el frontend esté en /index.html
app.use(express.static("public", { index: false }));

app.use("/auth", authRoutes);
app.use("/categorias", categoriasRoutes);
app.use("/componentes", componentesRoutes);
app.use("/clientes", clientesRoutes);
app.use("/ventas", ventasRoutes);

app.get("/", (req, res) => {
  res.json({
    mensaje: "API Tienda de Componentes Gamers",
    endpoints: {
      auth: ["/auth/registro", "/auth/login", "/auth/verificar", "/auth/perfil"],
      crud: ["/categorias", "/componentes", "/clientes", "/ventas"],
    },
    frontend: "http://localhost:" + (process.env.PORT || 3000) + "/index.html",
  });
});

// Ruta inexistente -> 404
app.use((req, res) => {
  res.status(404).json({ mensaje: "Endpoint no encontrado.", ruta: req.originalUrl });
});

// JSON malformado -> 400; cualquier otro error -> 500
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ mensaje: "El body debe ser JSON válido." });
  }
  console.error(error);
  return res.status(500).json({ mensaje: "Error interno del servidor.", error: error.message });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
