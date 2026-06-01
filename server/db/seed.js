/**
 * Seed script: Creates demo users and sample data for the Leave Management System.
 * Run with: npm run seed (from server directory)
 */

const bcrypt = require('bcryptjs');
const { getDb, createDefaultBalances } = require('./database');

const CURRENT_YEAR = new Date().getFullYear();

async function seed() {
  const db = getDb();

  console.log('🌱 Seeding database...\n');

  // Clear existing data
  db.exec('DELETE FROM leave_approvals');
  db.exec('DELETE FROM leave_requests');
  db.exec('DELETE FROM leave_balances');
  db.exec('DELETE FROM employees');
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('employees', 'leave_requests', 'leave_approvals', 'leave_balances')");

  // Hash password
  const passwordHash = bcrypt.hashSync('password123', 10);

  // Insert employees
  const insertEmployee = db.prepare(`
    INSERT INTO employees (name, email, password_hash, role, manager_id, department)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Admin
  const admin = insertEmployee.run('Admin User', 'admin@company.com', passwordHash, 'admin', null, 'Administration');
  console.log(`✅ Admin: admin@company.com (id: ${admin.lastInsertRowid})`);

  // Managers
  const mgr1 = insertEmployee.run('Alice Johnson', 'alice@company.com', passwordHash, 'manager', admin.lastInsertRowid, 'Engineering');
  const mgr2 = insertEmployee.run('Bob Williams', 'bob@company.com', passwordHash, 'manager', admin.lastInsertRowid, 'Marketing');
  console.log(`✅ Manager: alice@company.com (id: ${mgr1.lastInsertRowid})`);
  console.log(`✅ Manager: bob@company.com (id: ${mgr2.lastInsertRowid})`);

  // Employees under Alice (Engineering)
  const emp1 = insertEmployee.run('John Doe', 'john@company.com', passwordHash, 'employee', mgr1.lastInsertRowid, 'Engineering');
  const emp2 = insertEmployee.run('Jane Smith', 'jane@company.com', passwordHash, 'employee', mgr1.lastInsertRowid, 'Engineering');
  const emp3 = insertEmployee.run('Charlie Brown', 'charlie@company.com', passwordHash, 'employee', mgr1.lastInsertRowid, 'Engineering');

  // Employees under Bob (Marketing)
  const emp4 = insertEmployee.run('Diana Prince', 'diana@company.com', passwordHash, 'employee', mgr2.lastInsertRowid, 'Marketing');
  const emp5 = insertEmployee.run('Eve Adams', 'eve@company.com', passwordHash, 'employee', mgr2.lastInsertRowid, 'Marketing');

  console.log(`✅ Employees: john, jane, charlie, diana, eve @company.com`);

  // Create leave balances for all users
  const allIds = [
    admin.lastInsertRowid, mgr1.lastInsertRowid, mgr2.lastInsertRowid,
    emp1.lastInsertRowid, emp2.lastInsertRowid, emp3.lastInsertRowid,
    emp4.lastInsertRowid, emp5.lastInsertRowid
  ];
  for (const id of allIds) {
    createDefaultBalances(id, CURRENT_YEAR);
  }
  console.log(`✅ Leave balances created for ${CURRENT_YEAR}\n`);

  // Insert sample leave requests
  const insertLeave = db.prepare(`
    INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertApproval = db.prepare(`
    INSERT INTO leave_approvals (leave_request_id, manager_id, action, comments, acted_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const updateBalance = db.prepare(`
    UPDATE leave_balances SET used_days = used_days + ?
    WHERE employee_id = ? AND leave_type = ? AND year = ?
  `);

  // John's leaves
  const l1 = insertLeave.run(emp1.lastInsertRowid, 'casual', `${CURRENT_YEAR}-03-10`, `${CURRENT_YEAR}-03-11`, 'Family celebration', 'approved', `${CURRENT_YEAR}-03-05 09:00:00`, `${CURRENT_YEAR}-03-06 10:00:00`);
  insertApproval.run(l1.lastInsertRowid, mgr1.lastInsertRowid, 'approved', 'Enjoy!', `${CURRENT_YEAR}-03-06 10:00:00`);
  updateBalance.run(2, emp1.lastInsertRowid, 'casual', CURRENT_YEAR);

  const l2 = insertLeave.run(emp1.lastInsertRowid, 'sick', `${CURRENT_YEAR}-04-15`, `${CURRENT_YEAR}-04-15`, 'Doctor appointment', 'approved', `${CURRENT_YEAR}-04-14 08:30:00`, `${CURRENT_YEAR}-04-14 11:00:00`);
  insertApproval.run(l2.lastInsertRowid, mgr1.lastInsertRowid, 'approved', null, `${CURRENT_YEAR}-04-14 11:00:00`);
  updateBalance.run(1, emp1.lastInsertRowid, 'sick', CURRENT_YEAR);

  const l3 = insertLeave.run(emp1.lastInsertRowid, 'earned', `${CURRENT_YEAR}-05-20`, `${CURRENT_YEAR}-05-24`, 'Family vacation', 'rejected', `${CURRENT_YEAR}-05-15 10:00:00`, `${CURRENT_YEAR}-05-16 09:00:00`);
  insertApproval.run(l3.lastInsertRowid, mgr1.lastInsertRowid, 'rejected', 'Critical release week, please reschedule', `${CURRENT_YEAR}-05-16 09:00:00`);

  // Pending leave for John (future date)
  const futureStart = new Date();
  futureStart.setDate(futureStart.getDate() + 14);
  const futureEnd = new Date(futureStart);
  futureEnd.setDate(futureEnd.getDate() + 2);
  const fmtStart = futureStart.toISOString().split('T')[0];
  const fmtEnd = futureEnd.toISOString().split('T')[0];

  insertLeave.run(emp1.lastInsertRowid, 'casual', fmtStart, fmtEnd, 'Personal errand', 'pending', new Date().toISOString(), new Date().toISOString());
  updateBalance.run(3, emp1.lastInsertRowid, 'casual', CURRENT_YEAR);

  // Jane's leaves
  const l5 = insertLeave.run(emp2.lastInsertRowid, 'sick', `${CURRENT_YEAR}-02-20`, `${CURRENT_YEAR}-02-21`, 'Flu recovery', 'approved', `${CURRENT_YEAR}-02-19 09:00:00`, `${CURRENT_YEAR}-02-19 14:00:00`);
  insertApproval.run(l5.lastInsertRowid, mgr1.lastInsertRowid, 'approved', 'Get well soon!', `${CURRENT_YEAR}-02-19 14:00:00`);
  updateBalance.run(2, emp2.lastInsertRowid, 'sick', CURRENT_YEAR);

  // Pending leave for Jane
  const janeStart = new Date();
  janeStart.setDate(janeStart.getDate() + 7);
  const janeEnd = new Date(janeStart);
  janeEnd.setDate(janeEnd.getDate() + 1);
  insertLeave.run(emp2.lastInsertRowid, 'casual', janeStart.toISOString().split('T')[0], janeEnd.toISOString().split('T')[0], 'Wedding attendance', 'pending', new Date().toISOString(), new Date().toISOString());
  updateBalance.run(2, emp2.lastInsertRowid, 'casual', CURRENT_YEAR);

  // Diana's leaves (Marketing)
  const l7 = insertLeave.run(emp4.lastInsertRowid, 'earned', `${CURRENT_YEAR}-04-01`, `${CURRENT_YEAR}-04-05`, 'Spring break trip', 'approved', `${CURRENT_YEAR}-03-25 10:00:00`, `${CURRENT_YEAR}-03-26 09:00:00`);
  insertApproval.run(l7.lastInsertRowid, mgr2.lastInsertRowid, 'approved', 'Have a great trip!', `${CURRENT_YEAR}-03-26 09:00:00`);
  updateBalance.run(5, emp4.lastInsertRowid, 'earned', CURRENT_YEAR);

  // Pending leave for Charlie
  const charlieStart = new Date();
  charlieStart.setDate(charlieStart.getDate() + 10);
  insertLeave.run(emp3.lastInsertRowid, 'sick', charlieStart.toISOString().split('T')[0], charlieStart.toISOString().split('T')[0], 'Dental appointment', 'pending', new Date().toISOString(), new Date().toISOString());
  updateBalance.run(1, emp3.lastInsertRowid, 'sick', CURRENT_YEAR);

  console.log('✅ Sample leave requests created\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Seed complete! Demo credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Admin:    admin@company.com / password123');
  console.log('  Manager:  alice@company.com / password123');
  console.log('  Manager:  bob@company.com   / password123');
  console.log('  Employee: john@company.com  / password123');
  console.log('  Employee: jane@company.com  / password123');
  console.log('  Employee: charlie@company.com / password123');
  console.log('  Employee: diana@company.com / password123');
  console.log('  Employee: eve@company.com   / password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

seed().catch(console.error);
