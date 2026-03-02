import { db } from "@/lib/db";

export async function recalcStock(producto_id) {

  // IMPORTANTE: stock_total es FIJO y se establece manualmente
  // Las ubicaciones DISTRIBUYEN ese stock, no lo crean
  // Solo recalculamos cuánto está asignado a ubicaciones

  const [sum] = await db.query(`
    SELECT IFNULL(SUM(stock),0) AS total_asignado
    FROM stock_parcial
    WHERE producto_id=?
  `, [producto_id]);

  const totalAsignado = sum[0].total_asignado;

  // NO modificamos stock_total, solo actualizamos stock_disponible
  // stock_disponible = lo que NO está asignado a ubicaciones ni usado
  await db.query(`
    UPDATE productos
    SET 
      stock_disponible = stock_total - stock_usado
    WHERE id=?
  `, [producto_id]);
  
  return totalAsignado;
}
