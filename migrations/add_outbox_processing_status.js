const mysql = require("mysql2/promise");

/**
 * Agrega 'processing' al ENUM status de conversations_outbox.
 * Necesario para que acquireOutboxItem pueda marcar items en vuelo
 * y evitar doble procesamiento entre workers concurrentes.
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
    const [rows] = await conn.execute(`
      SELECT COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'conversations_outbox'
        AND COLUMN_NAME = 'status'
      LIMIT 1
    `, [database]);

    if (!rows.length) {
      console.log("conversations_outbox.status: tabla o columna no encontrada, saltando");
      return;
    }

    const currentType = rows[0].COLUMN_TYPE;
    if (currentType.includes("'processing'")) {
      console.log("conversations_outbox.status: 'processing' ya existe, nada que hacer");
      return;
    }

    await conn.execute(`
      ALTER TABLE conversations_outbox
      MODIFY COLUMN status
        ENUM('pending','processing','retrying','sent','failed')
        NOT NULL DEFAULT 'pending'
    `);
    console.log("conversations_outbox.status: 'processing' agregado al ENUM");
  } finally {
    await conn.end();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
