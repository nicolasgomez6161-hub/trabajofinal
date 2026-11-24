// Entidad Usuario: validación y forma de respuesta (nunca expone el hash).
import { textoRequerido, emailValido } from "../middleware/validacion.js";

class Usuario {
  constructor(id, nombre, email, password, rol = "vendedor", createdAt = null) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.password = password;
    this.rol = rol;
    this.created_at = createdAt;
  }

  validar() {
    textoRequerido(this.nombre, "nombre", 100);
    emailValido(this.email);
    if (typeof this.password !== "string" || this.password.length < 6) {
      throw new Error("password debe tener al menos 6 caracteres.");
    }
    if (!["admin", "vendedor"].includes(this.rol)) {
      throw new Error("rol debe ser 'admin' o 'vendedor'.");
    }
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      email: this.email,
      rol: this.rol,
      created_at: this.created_at,
    };
  }
}

export default Usuario;
