// PostgreSQL Real Concurrency & ACID Transactional Verification
// Validates genuine PostgreSQL row-level locks on simultaneous submissions with different answers.
// Does NOT use mock database or production database.
//
// Usage:
//   TEST_DATABASE_URL="postgresql://user:pass@host:5432/dbname" node scripts/test-postgres-concurrency.mjs

import { spawnSync, spawn } from 'node:child_process';

const dbUrl = process.env.TEST_DATABASE_URL;

console.log('🐘 PostgreSQL Real Concurrency Verification Harness\n');

if (!dbUrl) {
  console.log('========================================================================');
  console.log('STATUS: НЕ ПРОВЕРЕНО (Отсутствует TEST_DATABASE_URL для staging-окружения)');
  console.log('========================================================================');
  console.log('\nДля доказательства транзакционных свойств на настоящем PostgreSQL:');
  console.log('1. Подготовьте изолированную тестовую/staging БД (production использовать запрещено).');
  console.log('2. Необходимый доступ: CREATE TABLE, SELECT, INSERT, UPDATE, DELETE.');
  console.log('\nКоманды создания тестового пользователя в PostgreSQL:');
  console.log('   CREATE DATABASE nur_academy_test;');
  console.log("   CREATE USER nur_test_runner WITH PASSWORD 'secret_test_password';");
  console.log('   GRANT ALL PRIVILEGES ON DATABASE nur_academy_test TO nur_test_runner;');
  console.log('\nКоманда запуска проверки:');
  console.log('   TEST_DATABASE_URL="postgresql://nur_test_runner:secret_test_password@localhost:5432/nur_academy_test" \\');
  console.log('   node scripts/test-postgres-concurrency.mjs\n');
  process.exit(0);
}

function runSql(sql) {
  const result = spawnSync('psql', [dbUrl, '-c', sql], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`psql error: ${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

async function runAsyncPsql(sql) {
  return new Promise((resolve, reject) => {
    const proc = spawn('psql', [dbUrl, '-t', '-A', '-c', sql]);
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', d => { stdout += d; });
    proc.stderr.on('data', d => { stderr += d; });
    proc.on('close', code => {
      if (code !== 0) reject(new Error(stderr || stdout));
      else resolve(stdout.trim());
    });
  });
}

async function main() {
  console.log(`Connecting to PostgreSQL via provided TEST_DATABASE_URL...`);
  
  // Verify connectivity
  try {
    const versionOut = runSql('SELECT version();');
    console.log(`✓ Connected successfully: ${versionOut.split('\n')[2]?.trim() || 'PostgreSQL'}\n`);
  } catch (err) {
    console.error(`❌ Connection failed: ${err.message}`);
    process.exit(1);
  }

  // 1. SETUP ISOLATED TEST SCHEMAS
  console.log('Step 1: Creating isolated test tables...');
  runSql(`
    DROP TABLE IF EXISTS test_diagnostic_attempts CASCADE;
    DROP TABLE IF EXISTS test_exam_attempts CASCADE;

    CREATE TABLE test_diagnostic_attempts (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL,
      finished_at TIMESTAMPTZ,
      total_score INT,
      results_by_domain JSONB
    );

    CREATE TABLE test_exam_attempts (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL,
      finished_at TIMESTAMPTZ,
      total_score INT,
      answers_review JSONB
    );

    INSERT INTO test_diagnostic_attempts (id, user_id) 
    VALUES ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001');

    INSERT INTO test_exam_attempts (id, user_id)
    VALUES ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001');
  `);
  console.log('✓ Tables initialized.\n');

  // 2. DIAGNOSTIC RACE CONDITION WITH CONFLICTING SCORES (90 vs 20)
  console.log('Step 2: Executing concurrent DIAGNOSTIC completions with DIFFERENT answers...');
  const diagSql1 = `
    UPDATE test_diagnostic_attempts
    SET finished_at = NOW(), total_score = 90
    WHERE id = 'a0000000-0000-0000-0000-000000000001' AND finished_at IS NULL
    RETURNING id, total_score;
  `;

  const diagSql2 = `
    UPDATE test_diagnostic_attempts
    SET finished_at = NOW(), total_score = 20
    WHERE id = 'a0000000-0000-0000-0000-000000000001' AND finished_at IS NULL
    RETURNING id, total_score;
  `;

  const [resDiag1, resDiag2] = await Promise.all([
    runAsyncPsql(diagSql1),
    runAsyncPsql(diagSql2)
  ]);

  const diagWinnerCount = (resDiag1 ? 1 : 0) + (resDiag2 ? 1 : 0);
  console.log(`Client 1 returned: "${resDiag1 || '(0 rows - race lost)'}"`);
  console.log(`Client 2 returned: "${resDiag2 || '(0 rows - race lost)'}"`);
  if (diagWinnerCount !== 1) {
    throw new Error(`Concurrency violation! Expected exactly 1 winner, but got ${diagWinnerCount}`);
  }
  console.log('✓ PostgreSQL row-level lock guaranteed exactly 1 write winner.\n');

  // Verify committed row
  const committedDiag = runSql(`SELECT total_score, finished_at FROM test_diagnostic_attempts WHERE id = 'a0000000-0000-0000-0000-000000000001';`);
  console.log(`Committed diagnostic row in database:\n${committedDiag}`);

  // 3. EXAM RACE CONDITION WITH CONFLICTING SCORES (100 vs 0)
  console.log('\nStep 3: Executing concurrent EXAM completions with DIFFERENT answers...');
  const examSql1 = `
    UPDATE test_exam_attempts
    SET finished_at = NOW(), total_score = 100
    WHERE id = 'e0000000-0000-0000-0000-000000000001' AND finished_at IS NULL
    RETURNING id, total_score;
  `;

  const examSql2 = `
    UPDATE test_exam_attempts
    SET finished_at = NOW(), total_score = 0
    WHERE id = 'e0000000-0000-0000-0000-000000000001' AND finished_at IS NULL
    RETURNING id, total_score;
  `;

  const [resExam1, resExam2] = await Promise.all([
    runAsyncPsql(examSql1),
    runAsyncPsql(examSql2)
  ]);

  const examWinnerCount = (resExam1 ? 1 : 0) + (resExam2 ? 1 : 0);
  console.log(`Client 1 returned: "${resExam1 || '(0 rows - race lost)'}"`);
  console.log(`Client 2 returned: "${resExam2 || '(0 rows - race lost)'}"`);
  if (examWinnerCount !== 1) {
    throw new Error(`Concurrency violation! Expected exactly 1 winner, but got ${examWinnerCount}`);
  }
  console.log('✓ PostgreSQL row-level lock guaranteed exactly 1 exam write winner.\n');

  // 4. REPLAY ATTEMPT
  console.log('Step 4: Testing replay on already-finished attempt...');
  const replayOut = runSql(`
    UPDATE test_diagnostic_attempts
    SET total_score = 999
    WHERE id = 'a0000000-0000-0000-0000-000000000001' AND finished_at IS NULL;
  `);
  if (!replayOut.includes('UPDATE 0')) {
    throw new Error(`Replay should update 0 rows, got: ${replayOut}`);
  }
  console.log('✓ Replay update yielded 0 rows. State remains immutable.\n');

  // 5. CLEANUP
  console.log('Step 5: Cleaning up test tables...');
  runSql(`
    DROP TABLE test_diagnostic_attempts;
    DROP TABLE test_exam_attempts;
  `);
  console.log('✓ Test tables dropped.\n');

  console.log('========================================================================');
  console.log('🎉 REAL POSTGRESQL CONCURRENCY VERIFICATION PASSED');
  console.log('========================================================================');
}

main().catch(err => {
  console.error('\n❌ PostgreSQL verification failed:', err);
  process.exit(1);
});
