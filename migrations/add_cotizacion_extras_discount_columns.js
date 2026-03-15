const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '134.209.174.175',
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASS || '12345678root',
    database: process.env.DB_NAME || 'picaje'
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
