const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'leave_mgmt.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Initialize schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schema);
  }
  return db;
}

// Helper: calculate business days between two dates (inclusive)
function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let days = 0;
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days++;
    }
    current.setDate(current.getDate() + 1);
  }
  return days || 1; // minimum 1 day
}

// Helper: create default leave balances for a new employee
function createDefaultBalances(employeeId, year) {
  const db = getDb();
  const defaults = [
    { type: 'casual', total: 12 },
    { type: 'sick', total: 10 },
    { type: 'earned', total: 15 }
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO leave_balances (employee_id, leave_type, total_days, used_days, year)
    VALUES (?, ?, ?, 0, ?)
  `);

  for (const d of defaults) {
    stmt.run(employeeId, d.type, d.total, year);
  }
}

module.exports = { getDb, calculateDays, createDefaultBalances };
