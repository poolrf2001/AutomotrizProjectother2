const mysql = require("mysql2/promise");

async function columnExists(conn, tableName, columnName, databaseName) {
  const [rows] = await conn.execute(
    `
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = ?
      AND COLUMN_NAME = ?
    LIMIT 1
    `,
    [databaseName, tableName, columnName]
  );

  return rows.length > 0;
}

async function addColumnIfMissing(conn, tableName, columnName, definition, databaseName) {
  const exists = await columnExists(conn, tableName, columnName, databaseName);
  if (exists) {
    console.log(`${tableName}.${columnName}: ya existe`);
    return;
  }

  await conn.execute(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  console.log(`${tableName}.${columnName}: agregado`);
}

async function indexExists(conn, tableName, indexName, databaseName) {
  const [rows] = await conn.execute(
    `
    SELECT 1
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = ?
      AND INDEX_NAME = ?
    LIMIT 1
    `,
    [databaseName, tableName, indexName]
  );

  return rows.length > 0;
}

async function addIndexIfMissing(conn, tableName, indexName, indexSql, databaseName) {
  const exists = await indexExists(conn, tableName, indexName, databaseName);
  if (exists) {
    console.log(`${tableName}.${indexName}: ya existe`);
    return;
  }

  await conn.execute(`ALTER TABLE ${tableName} ADD ${indexSql}`);
  console.log(`${tableName}.${indexName}: agregado`);
}

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
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS conversations_outbox (
        id INT AUTO_INCREMENT PRIMARY KEY,
        message_log_id INT NOT NULL,
        session_id INT NOT NULL,
        phone VARCHAR(50) NULL,
        source VARCHAR(80) NULL,
        source_channel VARCHAR(50) NULL,
        idempotency_key VARCHAR(120) NULL,
        external_message_id VARCHAR(150) NULL,
        payload_json JSON NOT NULL,
        status ENUM('pending','retrying','sent','failed') NOT NULL DEFAULT 'pending',
        retry_count INT NOT NULL DEFAULT 0,
        last_error TEXT NULL,
        next_retry_at DATETIME NULL,
        sent_at DATETIME NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        INDEX idx_outbox_status_next_retry (status, next_retry_at),
        INDEX idx_outbox_session_id (session_id),
        INDEX idx_outbox_message_log_id (message_log_id),
        INDEX idx_outbox_idempotency_key (idempotency_key)
      )
    `);
    console.log("conversations_outbox: tabla verificada");

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS conversation_audit_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        action_type VARCHAR(80) NOT NULL,
        actor_user_id INT NULL,
        actor_role VARCHAR(60) NULL,
        changes_json JSON NULL,
        metadata_json JSON NULL,
        created_at DATETIME NOT NULL,
        INDEX idx_conversation_audit_session (session_id, id),
        INDEX idx_conversation_audit_actor (actor_user_id),
        INDEX idx_conversation_audit_action (action_type)
      )
    `);
    console.log("conversation_audit_log: tabla verificada");

    await addColumnIfMissing(
      conn,
      "agent_actions_log",
      "message_direction",
      "ENUM('inbound','outbound') NULL AFTER response_text",
      database
    );

    await addColumnIfMissing(
      conn,
      "agent_actions_log",
      "message_status",
      "ENUM('received','queued','sent','delivered','read','failed') NULL AFTER message_direction",
      database
    );

    await addColumnIfMissing(
      conn,
      "agent_actions_log",
      "source_channel",
      "VARCHAR(50) NULL AFTER message_status",
      database
    );

    await addColumnIfMissing(
      conn,
      "agent_actions_log",
      "external_message_id",
      "VARCHAR(150) NULL AFTER source_channel",
      database
    );

    await addColumnIfMissing(
      conn,
      "agent_actions_log",
      "idempotency_key",
      "VARCHAR(120) NULL AFTER external_message_id",
      database
    );

    await addColumnIfMissing(
      conn,
      "agent_actions_log",
      "provider_payload_json",
      "JSON NULL AFTER idempotency_key",
      database
    );

    await addIndexIfMissing(
      conn,
      "agent_actions_log",
      "idx_agent_actions_external_message_id",
      "INDEX idx_agent_actions_external_message_id (external_message_id)",
      database
    );

    await addIndexIfMissing(
      conn,
      "agent_actions_log",
      "idx_agent_actions_idempotency_key",
      "UNIQUE INDEX idx_agent_actions_idempotency_key (idempotency_key)",
      database
    );

    await addColumnIfMissing(
      conn,
      "conversation_sessions",
      "last_read_message_id",
      "INT NULL AFTER last_message_id",
      database
    );

    await addColumnIfMissing(
      conn,
      "conversation_sessions",
      "last_read_at",
      "DATETIME NULL AFTER last_read_message_id",
      database
    );

    await addIndexIfMissing(
      conn,
      "conversation_sessions",
      "idx_conversation_last_read_message_id",
      "INDEX idx_conversation_last_read_message_id (last_read_message_id)",
      database
    );

    await addColumnIfMissing(
      conn,
      "conversation_sessions",
      "assigned_agent_id",
      "INT NULL AFTER last_read_at",
      database
    );

    await addColumnIfMissing(
      conn,
      "conversation_sessions",
      "assignment_status",
      "ENUM('unassigned','open','pending','closed') NOT NULL DEFAULT 'unassigned' AFTER assigned_agent_id",
      database
    );

    await addIndexIfMissing(
      conn,
      "conversation_sessions",
      "idx_conversation_assigned_agent_id",
      "INDEX idx_conversation_assigned_agent_id (assigned_agent_id)",
      database
    );

    await addIndexIfMissing(
      conn,
      "conversation_sessions",
      "idx_conversation_assignment_status",
      "INDEX idx_conversation_assignment_status (assignment_status)",
      database
    );

    await addColumnIfMissing(
      conn,
      "conversation_sessions",
      "priority_level",
      "ENUM('low','normal','high','urgent') NOT NULL DEFAULT 'normal' AFTER assignment_status",
      database
    );

    await addColumnIfMissing(
      conn,
      "conversation_sessions",
      "sla_due_at",
      "DATETIME NULL AFTER priority_level",
      database
    );

    await addColumnIfMissing(
      conn,
      "conversation_sessions",
      "last_inbound_at",
      "DATETIME NULL AFTER sla_due_at",
      database
    );

    await addIndexIfMissing(
      conn,
      "conversation_sessions",
      "idx_conversation_priority_level",
      "INDEX idx_conversation_priority_level (priority_level)",
      database
    );

    await addIndexIfMissing(
      conn,
      "conversation_sessions",
      "idx_conversation_sla_due_at",
      "INDEX idx_conversation_sla_due_at (sla_due_at)",
      database
    );

    await conn.execute(`
      UPDATE agent_actions_log
      SET message_direction = CASE
        WHEN request_text IS NOT NULL AND request_text <> '' THEN 'inbound'
        ELSE 'outbound'
      END
      WHERE message_direction IS NULL
    `);

    await conn.execute(`
      UPDATE agent_actions_log
      SET message_status = CASE
        WHEN message_direction = 'inbound' THEN 'received'
        ELSE 'sent'
      END
      WHERE message_status IS NULL
    `);

    await conn.execute(`
      UPDATE agent_actions_log
      SET source_channel = 'whatsapp'
      WHERE source_channel IS NULL
    `);

    await conn.execute(`
      UPDATE conversation_sessions
      SET last_read_message_id = COALESCE(last_read_message_id, 0)
      WHERE last_read_message_id IS NULL
    `);

    await conn.execute(`
      UPDATE conversation_sessions
      SET assignment_status = 'unassigned'
      WHERE assignment_status IS NULL
    `);

    await conn.execute(`
      UPDATE conversation_sessions
      SET priority_level = COALESCE(priority_level, 'normal')
      WHERE priority_level IS NULL
    `);

    await conn.execute(`
      UPDATE conversation_sessions cs
      JOIN (
        SELECT session_id, MAX(created_at) AS last_inbound_at
        FROM agent_actions_log
        WHERE request_text IS NOT NULL AND request_text <> ''
        GROUP BY session_id
      ) x ON x.session_id = cs.id
      SET cs.last_inbound_at = COALESCE(cs.last_inbound_at, x.last_inbound_at)
      WHERE cs.last_inbound_at IS NULL
    `);

    console.log("Migracion de tracking de conversaciones completada");
  } finally {
    await conn.end();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
