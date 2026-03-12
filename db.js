const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'meta_ads.sqlite');
const db = new sqlite3.Database(dbPath);

function init() {
  db.serialize(() => {
    db.run(
      'CREATE TABLE IF NOT EXISTS meta_tokens (id INTEGER PRIMARY KEY CHECK (id = 1), access_token TEXT, token_type TEXT, expires_at INTEGER, updated_at INTEGER)'
    );
  });
}

function getToken() {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM meta_tokens WHERE id = 1', [], (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
}

function setToken({ accessToken, tokenType, expiresAt }) {
  const updatedAt = Date.now();
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO meta_tokens (id, access_token, token_type, expires_at, updated_at) VALUES (1, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET access_token=excluded.access_token, token_type=excluded.token_type, expires_at=excluded.expires_at, updated_at=excluded.updated_at',
      [accessToken || null, tokenType || null, expiresAt || null, updatedAt],
      function (err) {
        if (err) reject(err);
        else resolve(true);
      }
    );
  });
}

function clearToken() {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM meta_tokens WHERE id = 1', [], function (err) {
      if (err) reject(err);
      else resolve(true);
    });
  });
}

module.exports = { db, init, getToken, setToken, clearToken };
