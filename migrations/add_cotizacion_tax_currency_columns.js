const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: '193.203.175.251',
    user: 'u330129056_root',
    password: 'C!nBNAqJR0c',
    database: 'u330129056_picaje'
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
