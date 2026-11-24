// Frontend: todo el intercambio de datos se hace con fetch contra la API REST.
const API = window.location.origin;
const $ = (id) => document.getElementById(id);

let token = localStorage.getItem("tg_token");
const datos = { categorias: [], componentes: [], clientes: [], ventas: [] };
let itemsVenta = [];

const esc = (valor) =>
  String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const dinero = (valor) => "$" + Number(valor).toLocaleString("es-AR", { minimumFractionDigits: 2 });

const mensaje = (id, texto, esError = false) => {
  const elemento = $(id);
  elemento.textContent = texto;
  elemento.className = esError ? "error" : "exito";
};

async function api(ruta, opciones = {}) {
  const headers = { ...(opciones.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const tieneBody = opciones.body !== undefined;
  if (tieneBody) headers["Content-Type"] = "application/json";

  const respuesta = await fetch(API + ruta, {
    ...opciones,
    headers,
    body: tieneBody ? JSON.stringify(opciones.body) : undefined,
  });

  let contenido;
  try {
    contenido = await respuesta.json();
  } catch {
    contenido = { mensaje: "La API no devolvió JSON." };
  }
  if (!respuesta.ok) {
    throw new Error(contenido.mensaje || contenido.detalle || `Error ${respuesta.status}`);
  }
  return contenido;
}

function mostrarSeccion(nombre) {
  document.querySelectorAll(".seccion").forEach((seccion) => seccion.classList.add("oculto"));
  $("seccion-" + nombre).classList.remove("oculto");
  document.querySelectorAll(".menu button[data-seccion]").forEach((boton) => {
    boton.classList.toggle("activo", boton.dataset.seccion === nombre);
  });
}

async function cargarDatos() {
  const [cats, comps, clis, vents] = await Promise.all([
    api("/categorias/listar"),
    api("/componentes/listar"),
    api("/clientes/listar"),
    api("/ventas/listar"),
  ]);
  datos.categorias = cats.data;
  datos.componentes = comps.data;
  datos.clientes = clis.data;
  datos.ventas = vents.data;

  $("total-componentes").textContent = datos.componentes.length;
  $("total-categorias").textContent = datos.categorias.length;
  $("total-clientes").textContent = datos.clientes.length;
  $("total-ventas").textContent = datos.ventas.length;

  llenarSelect($("comp-categoria"), datos.categorias, "nombre", true);
  llenarSelect($("ven-cliente"), datos.clientes, null, true);
  llenarSelect($("ven-componente"), datos.componentes, "nombre", true);

  renderizarComponentes();
  renderizarCategorias();
  renderizarClientes();
  renderizarVentas();
}

function llenarSelect(select, lista, campo, conPlaceholder) {
  const valorActual = select.value;
  select.innerHTML = conPlaceholder ? '<option value="">Seleccione...</option>' : "";
  for (const fila of lista) {
    const texto = campo ? fila[campo] : `${fila.nombre} ${fila.apellido}`;
    const opcion = document.createElement("option");
    opcion.value = fila.id;
    opcion.textContent = texto;
    select.appendChild(opcion);
  }
  if (valorActual) select.value = valorActual;
}

/* ---------- Componentes ---------- */

function renderizarComponentes(filas = datos.componentes) {
  $("tabla-componentes").innerHTML =
    filas
      .map(
        (c) => `<tr>
          <td>${c.id}</td><td>${esc(c.nombre)}</td><td>${esc(c.categoria_nombre)}</td>
          <td>${esc(c.marca)}</td><td>${dinero(c.precio)}</td><td>${c.stock}</td>
          <td class="acciones">
            <button type="button" data-editar-comp="${c.id}">Editar</button>
            <button type="button" class="boton-peligro" data-borrar-comp="${c.id}">Eliminar</button>
          </td></tr>`
      )
      .join("") || '<tr><td colspan="7">Sin componentes.</td></tr>';
}

function editarComponente(id) {
  const c = datos.componentes.find((item) => item.id === Number(id));
  if (!c) return;
  $("comp-id").value = c.id;
  $("comp-categoria").value = c.categoria_id;
  $("comp-nombre").value = c.nombre;
  $("comp-marca").value = c.marca;
  $("comp-modelo").value = c.modelo ?? "";
  $("comp-precio").value = c.precio;
  $("comp-stock").value = c.stock;
  $("comp-descripcion").value = c.descripcion ?? "";
  $("comp-activo").checked = Boolean(c.activo);
}

$("form-componente").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = $("comp-id").value;
  const body = {
    categoria_id: Number($("comp-categoria").value),
    nombre: $("comp-nombre").value,
    marca: $("comp-marca").value,
    modelo: $("comp-modelo").value,
    precio: Number($("comp-precio").value),
    stock: Number($("comp-stock").value),
    descripcion: $("comp-descripcion").value,
    activo: $("comp-activo").checked ? 1 : 0,
  };
  try {
    if (id) await api("/componentes/modificar", { method: "PUT", body: { id, ...body } });
    else await api("/componentes/alta", { method: "POST", body });
    mensaje("msg-componentes", id ? "Componente modificado." : "Componente creado.");
    $("form-componente").reset();
    $("comp-id").value = "";
    await cargarDatos();
  } catch (error) {
    mensaje("msg-componentes", error.message, true);
  }
});

$("comp-nuevo").addEventListener("click", () => {
  $("form-componente").reset();
  $("comp-id").value = "";
});

$("btn-buscar-componentes").addEventListener("click", async () => {
  try {
    const q = encodeURIComponent($("filtro-componentes").value.trim());
    const respuesta = await api("/componentes/listar" + (q ? "?q=" + q : ""));
    renderizarComponentes(respuesta.data);
  } catch (error) {
    mensaje("msg-componentes", error.message, true);
  }
});

$("tabla-componentes").addEventListener("click", async (e) => {
  const editar = e.target.dataset.editarComp;
  const borrar = e.target.dataset.borrarComp;
  if (editar) return editarComponente(editar);
  if (borrar && confirm("¿Eliminar el componente " + borrar + "?")) {
    try {
      await api("/componentes/eliminar/" + borrar, { method: "DELETE" });
      mensaje("msg-componentes", "Componente eliminado.");
      await cargarDatos();
    } catch (error) {
      mensaje("msg-componentes", error.message, true);
    }
  }
});

/* ---------- Categorías ---------- */

function renderizarCategorias() {
  $("tabla-categorias").innerHTML =
    datos.categorias
      .map(
        (c) => `<tr><td>${c.id}</td><td>${esc(c.nombre)}</td><td>${esc(c.descripcion)}</td>
        <td class="acciones">
          <button type="button" data-editar-cat="${c.id}">Editar</button>
          <button type="button" class="boton-peligro" data-borrar-cat="${c.id}">Eliminar</button>
        </td></tr>`
      )
      .join("") || '<tr><td colspan="4">Sin categorías.</td></tr>';
}

$("form-categoria").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = $("cat-id").value;
  const body = { nombre: $("cat-nombre").value, descripcion: $("cat-descripcion").value };
  try {
    if (id) await api("/categorias/modificar", { method: "PUT", body: { id, ...body } });
    else await api("/categorias/alta", { method: "POST", body });
    mensaje("msg-categorias", id ? "Categoría modificada." : "Categoría creada.");
    $("form-categoria").reset();
    $("cat-id").value = "";
    await cargarDatos();
  } catch (error) {
    mensaje("msg-categorias", error.message, true);
  }
});

$("cat-nuevo").addEventListener("click", () => {
  $("form-categoria").reset();
  $("cat-id").value = "";
});

$("tabla-categorias").addEventListener("click", async (e) => {
  const editar = e.target.dataset.editarCat;
  const borrar = e.target.dataset.borrarCat;
  if (editar) {
    const c = datos.categorias.find((item) => item.id === Number(editar));
    $("cat-id").value = c.id;
    $("cat-nombre").value = c.nombre;
    $("cat-descripcion").value = c.descripcion ?? "";
  } else if (borrar && confirm("¿Eliminar la categoría " + borrar + "?")) {
    try {
      await api("/categorias/eliminar/" + borrar, { method: "DELETE" });
      mensaje("msg-categorias", "Categoría eliminada.");
      await cargarDatos();
    } catch (error) {
      mensaje("msg-categorias", error.message, true);
    }
  }
});

/* ---------- Clientes ---------- */

function renderizarClientes(filas = datos.clientes) {
  $("tabla-clientes").innerHTML =
    filas
      .map(
        (c) => `<tr><td>${c.id}</td><td>${esc(c.nombre)} ${esc(c.apellido)}</td>
        <td>${esc(c.email)}</td><td>${esc(c.telefono)}</td>
        <td class="acciones">
          <button type="button" data-editar-cli="${c.id}">Editar</button>
          <button type="button" class="boton-peligro" data-borrar-cli="${c.id}">Eliminar</button>
        </td></tr>`
      )
      .join("") || '<tr><td colspan="5">Sin clientes.</td></tr>';
}

$("form-cliente").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = $("cli-id").value;
  const body = {
    nombre: $("cli-nombre").value,
    apellido: $("cli-apellido").value,
    email: $("cli-email").value,
    telefono: $("cli-telefono").value,
    direccion: $("cli-direccion").value,
  };
  try {
    if (id) await api("/clientes/modificar", { method: "PUT", body: { id, ...body } });
    else await api("/clientes/alta", { method: "POST", body });
    mensaje("msg-clientes", id ? "Cliente modificado." : "Cliente creado.");
    $("form-cliente").reset();
    $("cli-id").value = "";
    await cargarDatos();
  } catch (error) {
    mensaje("msg-clientes", error.message, true);
  }
});

$("cli-nuevo").addEventListener("click", () => {
  $("form-cliente").reset();
  $("cli-id").value = "";
});

$("btn-buscar-clientes").addEventListener("click", async () => {
  try {
    const q = encodeURIComponent($("filtro-clientes").value.trim());
    const respuesta = await api("/clientes/listar" + (q ? "?q=" + q : ""));
    renderizarClientes(respuesta.data);
  } catch (error) {
    mensaje("msg-clientes", error.message, true);
  }
});

$("tabla-clientes").addEventListener("click", async (e) => {
  const editar = e.target.dataset.editarCli;
  const borrar = e.target.dataset.borrarCli;
  if (editar) {
    const c = datos.clientes.find((item) => item.id === Number(editar));
    $("cli-id").value = c.id;
    $("cli-nombre").value = c.nombre;
    $("cli-apellido").value = c.apellido;
    $("cli-email").value = c.email;
    $("cli-telefono").value = c.telefono ?? "";
    $("cli-direccion").value = c.direccion ?? "";
  } else if (borrar && confirm("¿Eliminar el cliente " + borrar + "?")) {
    try {
      await api("/clientes/eliminar/" + borrar, { method: "DELETE" });
      mensaje("msg-clientes", "Cliente eliminado.");
      await cargarDatos();
    } catch (error) {
      mensaje("msg-clientes", error.message, true);
    }
  }
});

/* ---------- Ventas ---------- */

function renderizarItems() {
  const total = itemsVenta.reduce(
    (suma, item) => suma + item.precio_unitario * item.cantidad,
    0
  );
  $("items-venta").innerHTML =
    itemsVenta
      .map(
        (item, indice) =>
          `<li>${esc(item.nombre)} x${item.cantidad} — ${dinero(item.precio_unitario * item.cantidad)}
           <button type="button" data-quitar="${indice}">Quitar</button></li>`
      )
      .join("") || "<li>Sin items agregados.</li>";
  $("ven-total").textContent = total.toLocaleString("es-AR", { minimumFractionDigits: 2 });
}

$("ven-agregar").addEventListener("click", () => {
  const id = Number($("ven-componente").value);
  const cantidad = Number($("ven-cantidad").value);
  const componente = datos.componentes.find((c) => c.id === id);
  if (!componente || !Number.isInteger(cantidad) || cantidad < 1) {
    mensaje("msg-ventas", "Elegí un componente y una cantidad válida.", true);
    return;
  }
  itemsVenta.push({
    componente_id: id,
    nombre: componente.nombre,
    cantidad,
    precio_unitario: Number(componente.precio),
  });
  renderizarItems();
});

$("items-venta").addEventListener("click", (e) => {
  const indice = e.target.dataset.quitar;
  if (indice !== undefined) {
    itemsVenta.splice(Number(indice), 1);
    renderizarItems();
  }
});

$("form-venta").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (itemsVenta.length === 0) {
    mensaje("msg-ventas", "Agregá al menos un componente a la venta.", true);
    return;
  }
  try {
    await api("/ventas/alta", {
      method: "POST",
      body: {
        cliente_id: Number($("ven-cliente").value),
        items: itemsVenta.map(({ componente_id, cantidad }) => ({ componente_id, cantidad })),
        observaciones: $("ven-observaciones").value,
      },
    });
    itemsVenta = [];
    renderizarItems();
    $("form-venta").reset();
    mensaje("msg-ventas", "Venta registrada y stock actualizado.");
    await cargarDatos();
  } catch (error) {
    mensaje("msg-ventas", error.message, true);
  }
});

function renderizarVentas() {
  $("tabla-ventas").innerHTML =
    datos.ventas
      .map(
        (v) => `<tr>
          <td>${v.id}</td><td>${esc(v.cliente_nombre)}</td><td>${esc(v.fecha)}</td>
          <td>${dinero(v.total)}</td><td>${esc(v.estado)}</td>
          <td>${v.detalles.map((d) => `${esc(d.componente_nombre)} x${d.cantidad}`).join(", ")}</td>
          <td class="acciones">
            <button type="button" data-editar-ven="${v.id}">Editar</button>
            <button type="button" class="boton-peligro" data-borrar-ven="${v.id}">Eliminar</button>
          </td></tr>`
      )
      .join("") || '<tr><td colspan="7">Sin ventas.</td></tr>';
}

$("form-venta-editar").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = $("ved-id").value;
  if (!id) return mensaje("msg-ventas", "Seleccioná una venta de la tabla.", true);
  try {
    await api("/ventas/modificar", {
      method: "PUT",
      body: {
        id: Number(id),
        estado: $("ved-estado").value,
        observaciones: $("ved-observaciones").value,
      },
    });
    $("ved-id").value = "";
    mensaje("msg-ventas", "Venta modificada.");
    await cargarDatos();
  } catch (error) {
    mensaje("msg-ventas", error.message, true);
  }
});

$("tabla-ventas").addEventListener("click", async (e) => {
  const editar = e.target.dataset.editarVen;
  const borrar = e.target.dataset.borrarVen;
  if (editar) {
    const v = datos.ventas.find((item) => item.id === Number(editar));
    $("ved-id").value = v.id;
    $("ved-estado").value = v.estado;
    $("ved-observaciones").value = v.observaciones ?? "";
  } else if (borrar && confirm("¿Eliminar la venta " + borrar + " y devolver el stock?")) {
    try {
      await api("/ventas/eliminar/" + borrar, { method: "DELETE" });
      mensaje("msg-ventas", "Venta eliminada.");
      await cargarDatos();
    } catch (error) {
      mensaje("msg-ventas", error.message, true);
    }
  }
});

/* ---------- Login, registro y navegación ---------- */

async function entrar() {
  $("login-card").classList.add("oculto");
  $("barra").hidden = false;
  $("app").classList.remove("oculto");
  try {
    await cargarDatos();
    mensaje("mensaje-app", "Sesión iniciada. Bienvenido a la tienda.");
  } catch (error) {
    mensaje("mensaje-app", "No se pudieron cargar los datos: " + error.message, true);
  }
  mostrarSeccion("resumen");
}

$("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const respuesta = await api("/auth/login", {
      method: "POST",
      body: { email: $("login-email").value, password: $("login-password").value },
    });
    token = respuesta.token;
    localStorage.setItem("tg_token", token);
    await entrar();
  } catch (error) {
    mensaje("mensaje-login", error.message, true);
  }
});

$("mostrar-registro").addEventListener("click", () => {
  $("form-registro").classList.remove("oculto");
  $("form-login").classList.add("oculto");
});

$("volver-login").addEventListener("click", () => {
  $("form-registro").classList.add("oculto");
  $("form-login").classList.remove("oculto");
});

$("form-registro").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await api("/auth/registro", {
      method: "POST",
      body: {
        nombre: $("reg-nombre").value,
        email: $("reg-email").value,
        password: $("reg-password").value,
        password_confirmacion: $("reg-confirmacion").value,
      },
    });
    mensaje("mensaje-login", "Cuenta creada. Ya podés ingresar.");
    $("form-registro").classList.add("oculto");
    $("form-login").classList.remove("oculto");
  } catch (error) {
    mensaje("mensaje-login", error.message, true);
  }
});

document.querySelectorAll(".menu button[data-seccion]").forEach((boton) => {
  boton.addEventListener("click", async () => {
    const seccion = boton.dataset.seccion;
    mostrarSeccion(seccion);
    if (seccion === "perfil") {
      try {
        const respuesta = await api("/auth/perfil");
        $("datos-perfil").innerHTML = `<p><strong>Nombre:</strong> ${esc(respuesta.data.nombre)}</p>
          <p><strong>Email:</strong> ${esc(respuesta.data.email)}</p>
          <p><strong>Rol:</strong> ${esc(respuesta.data.rol)}</p>`;
      } catch (error) {
        mensaje("mensaje-app", error.message, true);
      }
    }
  });
});

$("btn-cerrar").addEventListener("click", () => {
  localStorage.removeItem("tg_token");
  token = null;
  $("app").classList.add("oculto");
  $("barra").hidden = true;
  $("login-card").classList.remove("oculto");
  mensaje("mensaje-login", "Sesión cerrada.");
});

renderizarItems();

// Si ya hay un token guardado, lo validamos antes de mostrar la aplicación.
if (token) {
  api("/auth/verificar")
    .then(entrar)
    .catch(() => {
      localStorage.removeItem("tg_token");
      token = null;
    });
}
