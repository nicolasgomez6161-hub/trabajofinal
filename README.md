# Tienda de Componentes Gamers — Proyecto Final (PWD)

Sistema web de una tienda de componentes gamers desarrollado con **Node.js + Express**, **MySQL** y un frontend en **HTML, CSS y JavaScript** que consume la API con `fetch`. Incluye login con contraseñas hasheadas con **bcrypt**, JWT Bearer, 4 CRUDs, transacciones para ventas y una colección de Postman con casos de error.

> Los datos de ejemplo son pocos a propósito: 1 usuario, 2 categorías, 2 componentes, 1 cliente y 1 venta con 2 detalles.

## Requisitos cumplidos

| Requerimiento del PDF | Implementación |
|---|---|
| MySQL con al menos 5 tablas relacionadas (PK/FK) | 6 tablas: `usuarios`, `categorias`, `componentes`, `clientes`, `ventas`, `detalle_venta` |
| Registro e inicio de sesión con bcrypt | `POST /auth/registro` y `POST /auth/login`; hash bcrypt guardado en `usuarios.password` |
| Alta, modificación y baja solo con sesión | Middleware `verificarToken` (JWT) en todos los POST/PUT/DELETE |
| CRUDs de al menos 3 entidades | 4 CRUDs completos: categorías, componentes, clientes y ventas |
| API REST con consultas parametrizadas y códigos HTTP | `pool.execute` con `?`; respuestas 200, 201, 400, 401, 404 y 500 |
| Frontend con fetch | `public/index.html`, `public/styles.css`, `public/app.js` |
| Pruebas en Postman | `postman/TiendaGamer.postman_collection.json` (47 requests, 6 carpetas) |
| Entregables | Código sin `.env` (ver `.gitignore`), BD en `database/`, colección exportada y este README |

## Instalación

1. Instalar dependencias:

```bash
npm install
```

2. Crear la base de datos importando el SQL:

```bash
mysql -u root -p < database/tienda_gamer.sql
```

También podés importar `database/tienda_gamer.sql` desde phpMyAdmin. El archivo crea la base `tienda_gamer` si no existe.

3. Copiar `.env.example` como `.env` y ajustar los datos de MySQL:

```bash
copy .env.example .env   # Windows
cp .env.example .env     # Linux/Mac
```

> **No subir `.env` a GitHub**: contiene credenciales y el secreto JWT. Ya está excluido por `.gitignore`.

4. Levantar el servidor:

```bash
npm start
# o, con recarga automática:
npm run dev
```

5. Abrir el frontend en <http://localhost:3000/index.html> y la API en <http://localhost:3000>.

## Usuarios de prueba

| Email | Contraseña | Rol |
|---|---|---|
| `admin@tiendagamer.test` | `admin123` | admin (viene en el SQL) |
| cualquiera creado desde `/auth/registro` | la que elijas | vendedor |

## Base de datos

```
tienda_gamer
├── usuarios (id, nombre, email, password bcrypt, rol)
├── categorias (id, nombre, descripcion)
├── componentes (id, categoria_id → categorias, nombre, marca, precio, stock, activo)
├── clientes (id, nombre, apellido, email, telefono, direccion)
├── ventas (id, cliente_id → clientes, usuario_id → usuarios, total, estado)
└── detalle_venta (id, venta_id → ventas, componente_id → componentes, cantidad, precio_unitario, subtotal)
```

Las FK usan `RESTRICT` donde no se permite borrar un padre con dependencias y `CASCADE` en `detalle_venta → ventas`. Alta y baja de ventas son **transaccionales**: descuentan/devuelven stock y nunca dejan detalles huérfanos.

## Endpoints

Base: `http://localhost:3000`

### Autenticación (públicas salvo las indicadas)

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| POST | `/auth/registro` | `{ nombre, email, password, password_confirmacion }` | Crea usuario vendedor con bcrypt |
| POST | `/auth/login` | `{ email, password }` | Devuelve token JWT |
| GET | `/auth/verificar` | — | Verifica token (protegida) |
| GET | `/auth/perfil` | — | Datos del usuario del token (protegida) |
| GET | `/auth/info` | — | Ayuda pública |

### CRUDs (lectura pública; POST/PUT/DELETE requieren `Authorization: Bearer <token>`)

| Entidad | Listar | Alta | Modificar | Baja |
|---|---|---|---|---|
| Categorías | `GET /categorias/listar` | `POST /categorias/alta` | `PUT /categorias/modificar` | `DELETE /categorias/eliminar/:id` |
| Componentes | `GET /componentes/listar?q=&categoria_id=` | `POST /componentes/alta` | `PUT /componentes/modificar` | `DELETE /componentes/eliminar/:id` |
| Clientes | `GET /clientes/listar?q=` | `POST /clientes/alta` | `PUT /clientes/modificar` | `DELETE /clientes/eliminar/:id` |
| Ventas | `GET /ventas/listar` | `POST /ventas/alta` | `PUT /ventas/modificar` | `DELETE /ventas/eliminar/:id` |

Ejemplo de alta de venta:

```json
POST /ventas/alta
Authorization: Bearer <token>
{
  "cliente_id": 1,
  "items": [{ "componente_id": 1, "cantidad": 1 }],
  "observaciones": "Venta de prueba"
}
```

## Postman

1. Importar `postman/TiendaGamer.postman_collection.json`.
2. La variable `baseUrl` ya apunta a `http://localhost:3000`.
3. Ejecutar primero **Login OK (200) - guarda token**: su script guarda el JWT en la variable `{{token}}`, que usan el resto de los requests.
4. Correr el resto de la colección. Incluye casos de **datos inválidos (400)**, **falta de sesión (401)**, **id inexistente (404)**, **JSON malformado (400)** y **endpoint inexistente (404)**.

## Estructura

```
server.js                 → Express, rutas, estáticos y manejo de errores
config/conexion.js        → pool de MySQL con consultas parametrizadas
middleware/               → verificación JWT y validaciones
entities/                 → reglas de negocio y validación por entidad
models/                   → único lugar con SQL (incluye transacciones de ventas)
controllers/              → lógica HTTP y códigos de respuesta
routes/                   → endpoints REST
public/                   → frontend HTML/CSS/JS con fetch
database/tienda_gamer.sql → esquema + datos de ejemplo
postman/                  → colección exportada
```
