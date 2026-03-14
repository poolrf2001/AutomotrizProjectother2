const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '134.209.174.175',
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASS || '12345678root',
    database: process.env.DB_NAME || 'picaje'
  });

  await conn.execute(`
    ALTER TABLE cotizaciones
      ADD COLUMN moneda_id INT NULL AFTER tarifa_hora,
      ADD COLUMN impuesto_id INT NULL AFTER moneda_id,
      ADD COLUMN incluir_igv TINYINT(1) NOT NULL DEFAULT 0 AFTER impuesto_id,
      ADD COLUMN impuesto_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 0 AFTER incluir_igv
  `);
  console.log('cotizaciones: columnas de moneda/impuesto agregadas');

  await conn.end();
  console.log('Migracion completada');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
