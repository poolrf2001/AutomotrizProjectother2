const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: '193.203.175.251',
    user: 'u330129056_root',
    password: 'C!nBNAqJR0c',
    database: 'u330129056_picaje'
  });

  await conn.execute(`
    ALTER TABLE cotizacion_extras
      ADD COLUMN descuento_tipo ENUM('porcentaje','monto') NOT NULL DEFAULT 'porcentaje' AFTER monto,
      ADD COLUMN descuento_valor DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER descuento_tipo
  `);
  console.log('cotizacion_extras: columnas de descuento agregadas');

  await conn.end();
  console.log('Migracion completada');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
