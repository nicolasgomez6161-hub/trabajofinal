import { textoRequerido, textoOpcional, emailValido } from "../middleware/validacion.js";

class Cliente {
  constructor(id, nombre, apellido, email, telefono = null, direccion = null) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.telefono = telefono;
    this.direccion = direccion;
  }

  validar() {
    textoRequerido(this.nombre, "nombre", 100);
    textoRequerido(this.apellido, "apellido", 100);
    emailValido(this.email);
    textoOpcional(this.telefono, "telefono", 30);
    textoOpcional(this.direccion, "direccion", 200);
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      telefono: this.telefono,
      direccion: this.direccion,
    };
  }
}

export default Cliente;
