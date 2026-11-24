-- ============================================================
-- Tienda de componentes gamers - base de datos MySQL
-- Importar en phpMyAdmin o: mysql -u root -p < database/tienda_gamer.sql
-- Datos de ejemplo: solo 1 o 2 registros por tabla.
-- Usuario de prueba: admin@tiendagamer.test / admin123 (hash bcrypt)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS `tienda_gamer`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `tienda_gamer`;

DROP TABLE IF EXISTS `detalle_venta`;
DROP TABLE IF EXISTS `ventas`;
DROP TABLE IF EXISTS `componentes`;
DROP TABLE IF EXISTS `clientes`;
DROP TABLE IF EXISTS `categorias`;
DROP TABLE IF EXISTS `usuarios`;

-- Usuarios con contraseña hasheada con bcrypt
CREATE TABLE `usuarios` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','vendedor') NOT NULL DEFAULT 'vendedor',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `categorias` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categorias_nombre_unique` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `componentes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `categoria_id` int unsigned NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `marca` varchar(80) NOT NULL,
  `modelo` varchar(80) DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int unsigned NOT NULL DEFAULT 0,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `componentes_categoria_id_foreign` (`categoria_id`),
  CONSTRAINT `componentes_categoria_id_foreign`
    FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `clientes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clientes_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ventas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `cliente_id` int unsigned NOT NULL,
  `usuario_id` int unsigned NOT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado` enum('pendiente','confirmada','anulada') NOT NULL DEFAULT 'confirmada',
  `observaciones` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ventas_cliente_id_foreign` (`cliente_id`),
  KEY `ventas_usuario_id_foreign` (`usuario_id`),
  CONSTRAINT `ventas_cliente_id_foreign`
    FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `ventas_usuario_id_foreign`
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `detalle_venta` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `venta_id` int unsigned NOT NULL,
  `componente_id` int unsigned NOT NULL,
  `cantidad` int unsigned NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `detalle_venta_venta_id_componente_id_unique` (`venta_id`, `componente_id`),
  KEY `detalle_venta_componente_id_foreign` (`componente_id`),
  CONSTRAINT `detalle_venta_venta_id_foreign`
    FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `detalle_venta_componente_id_foreign`
    FOREIGN KEY (`componente_id`) REFERENCES `componentes` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- Datos de ejemplo (pocos registros)
-- ------------------------------------------------------------

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`) VALUES
  (1, 'Admin Tienda', 'admin@tiendagamer.test', '$2b$10$tO9qTV/5ECIEJ1OxSpFzquxgRf7YXtEloY3CyEXk.fAYtaxNAaaY6', 'admin');

INSERT INTO `categorias` (`id`, `nombre`, `descripcion`) VALUES
  (1, 'Placas de video', 'GPU para gaming'),
  (2, 'Procesadores', 'CPU para gaming');

INSERT INTO `componentes` (`id`, `categoria_id`, `nombre`, `marca`, `modelo`, `precio`, `stock`, `descripcion`, `activo`) VALUES
  (1, 1, 'RTX 4060 8GB', 'NVIDIA', 'GeForce RTX 4060', 450000.00, 5, 'Placa de video 8GB GDDR6', 1),
  (2, 2, 'Ryzen 5 7600', 'AMD', 'Ryzen 5 7600', 290000.00, 8, 'Procesador 6 nucleos AM5', 1);

INSERT INTO `clientes` (`id`, `nombre`, `apellido`, `email`, `telefono`, `direccion`) VALUES
  (1, 'Gian', 'Borlenghi', 'gian@example.com', '2615550000', 'Calle Sarmiento 123');

INSERT INTO `ventas` (`id`, `cliente_id`, `usuario_id`, `fecha`, `total`, `estado`, `observaciones`) VALUES
  (1, 1, 1, NOW(), 740000.00, 'confirmada', 'Venta de ejemplo');

INSERT INTO `detalle_venta` (`id`, `venta_id`, `componente_id`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
  (1, 1, 1, 1, 450000.00, 450000.00),
  (2, 1, 2, 1, 290000.00, 290000.00);

-- Fin del volcado.
