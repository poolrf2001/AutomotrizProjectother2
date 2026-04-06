const mysql = require("mysql2/promise");

(async () => {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    // 1. Agregar columnas tone_preset y sinonimos_json
    console.log("Agregando columnas tone_preset y sinonimos_json a agent_prompt_config...");
    await conn.execute(`
      ALTER TABLE agent_prompt_config
        ADD COLUMN IF NOT EXISTS tone_preset    VARCHAR(50) DEFAULT 'neutro',
        ADD COLUMN IF NOT EXISTS sinonimos_json TEXT        DEFAULT NULL
    `);
    console.log("Columnas agregadas.");

    // 2. Actualizar nombre del agente a Wankita y concesionaria a WankaMotors
    console.log("Actualizando agent_name y dealer_name para taller y ventas...");
    const [result] = await conn.execute(`
      UPDATE agent_prompt_config
        SET agent_name  = 'Wankita',
            dealer_name = 'WankaMotors'
        WHERE agent_key IN ('taller', 'ventas')
    `);
    console.log(`Filas actualizadas: ${result.affectedRows}`);

    console.log("Migración completada exitosamente.");
  } finally {
    await conn.end();
  }
})();
