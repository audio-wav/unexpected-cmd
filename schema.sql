CREATE TABLE IF NOT EXISTS stats (id TEXT PRIMARY KEY, count INTEGER);
INSERT OR IGNORE INTO stats (id, count) VALUES ('executions', 0);
