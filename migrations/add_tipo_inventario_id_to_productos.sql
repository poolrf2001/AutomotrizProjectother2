-- Migración: Agregar relación tipo_inventario_id a tabla productos
-- Fecha: 2026-03-01
-- Descripción: Relaciona cada producto con su tipo de inventario (Aceites, Fluidos, Repuestos, etc.)

-- OPCIÓN 1: Si la columna NO existe aún (ejecuta esto):
-- ALTER TABLE productos 
-- ADD COLUMN tipo_inventario_id INT NULL AFTER descripcion;

-- OPCIÓN 2: Si la columna YA existe (tu caso actual), solo crea el índice:
CREATE INDEX IF NOT EXISTS idx_productos_tipo_inventario ON productos(tipo_inventario_id);

-- Nota: Los productos existentes quedarán con tipo_inventario_id = NULL
-- Se deberán actualizar manualmente desde el sistema
