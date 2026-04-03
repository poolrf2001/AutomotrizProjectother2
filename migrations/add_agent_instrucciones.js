const mysql = require("mysql2/promise");

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
    console.log("Creando tabla agent_instrucciones...");

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS agent_instrucciones (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        agent_key     VARCHAR(50)  NOT NULL,
        texto         TEXT         NOT NULL,
        categoria     VARCHAR(80)  DEFAULT NULL,
        es_activa     TINYINT(1)   NOT NULL DEFAULT 1,
        vigencia_hasta DATE         DEFAULT NULL,
        agregada_por  VARCHAR(100) NOT NULL,
        agregada_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        desactivada_por VARCHAR(100) DEFAULT NULL,
        desactivada_at  DATETIME   DEFAULT NULL,
        INDEX idx_agent_key (agent_key),
        INDEX idx_es_activa (es_activa)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log("Migración completada exitosamente.");
  } finally {
    await conn.end();
  }
})();
