import { textoRequerido, textoOpcional } from "../middleware/validacion.js";

class Categoria {
  constructor(id, nombre, descripcion = null) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
  }

  validar() {
    textoRequerido(this.nombre, "nombre", 100);
    textoOpcional(this.descripcion, "descripcion", 255);
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
    };
  }
}

export default Categoria;
