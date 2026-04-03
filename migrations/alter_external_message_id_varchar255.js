const mysql = require("mysql2/promise");

/**
 * Amplía external_message_id de VARCHAR(150) a VARCHAR(255) en agent_actions_log.
 * Los IDs de mensajes de Instagram (base64 encoded) pueden superar los 150 chars
 * (~164 chars observado), causando ER_DATA_TOO_LONG en MySQL strict mode.
 */
(async () => {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASS;
  const database = process.env.DB_NAME;

  if (!host || !user || !database) {
    throw new Error("Faltan variables DB_HOST, DB_USER o DB_NAME en el entorno");
  }

  const conn = await mysql.createConnection({ host, user, password, database });

  try {
    const [rows] = await conn.execute(
      `SELECT COLUMN_TYPE
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ?
         AND TABLE_NAME = 'agent_actions_log'
         AND COLUMN_NAME = 'external_message_id'
       LIMIT 1`,
      [database]
    );

    if (!rows.length) {
      console.log("agent_actions_log.external_message_id: columna no encontrada, saltando");
      return;
    }

    const currentType = rows[0].COLUMN_TYPE.toLowerCase();
    if (currentType.includes("varchar(255)") || currentType.includes("text")) {
      console.log(`agent_actions_log.external_message_id: ya es ${rows[0].COLUMN_TYPE}, nada que hacer`);
      return;
    }

    await conn.execute(`
      ALTER TABLE agent_actions_log
      MODIFY COLUMN external_message_id VARCHAR(255) NULL
    `);
    console.log(`agent_actions_log.external_message_id: ampliado de ${rows[0].COLUMN_TYPE} a VARCHAR(255)`);
  } finally {
    await conn.end();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
