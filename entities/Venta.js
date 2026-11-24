class Venta {
  constructor(id, clienteId, usuarioId, fecha, total, estado, observaciones, detalles = []) {
    this.id = id;
    this.cliente_id = clienteId;
    this.usuario_id = usuarioId;
    this.fecha = fecha;
    this.total = total;
    this.estado = estado;
    this.observaciones = observaciones;
    this.detalles = detalles;
  }

  toJSON() {
    return {
      id: this.id,
      cliente_id: this.cliente_id,
      usuario_id: this.usuario_id,
      fecha: this.fecha,
      total: Number(this.total),
      estado: this.estado,
      observaciones: this.observaciones,
      detalles: this.detalles,
    };
  }
}

export default Venta;
