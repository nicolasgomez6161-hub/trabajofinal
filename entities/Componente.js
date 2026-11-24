import { textoRequerido, textoOpcional, numeroRequerido } from "../middleware/validacion.js";

class Componente {
  constructor(id, categoriaId, nombre, marca, modelo, precio, stock, descripcion, activo = 1) {
    this.id = id;
    this.categoria_id = categoriaId;
    this.nombre = nombre;
    this.marca = marca;
    this.modelo = modelo;
    this.precio = precio;
    this.stock = stock;
    this.descripcion = descripcion;
    this.activo = activo;
  }

  validar() {
    numeroRequerido(this.categoria_id, "categoria_id", 1);
    textoRequerido(this.nombre, "nombre", 150);
    textoRequerido(this.marca, "marca", 80);
    textoOpcional(this.modelo, "modelo", 80);
    numeroRequerido(this.precio, "precio", 0);
    numeroRequerido(this.stock, "stock", 0);
    if (!Number.isInteger(Number(this.categoria_id))) throw new Error("categoria_id debe ser entero.");
    if (!Number.isInteger(Number(this.stock))) throw new Error("stock debe ser entero.");
    textoOpcional(this.descripcion, "descripcion", 500);
  }

  toJSON() {
    return {
      id: this.id,
      categoria_id: this.categoria_id,
      nombre: this.nombre,
      marca: this.marca,
      modelo: this.modelo,
      precio: Number(this.precio),
      stock: Number(this.stock),
      descripcion: this.descripcion,
      activo: Boolean(this.activo),
    };
  }
}

export default Componente;
