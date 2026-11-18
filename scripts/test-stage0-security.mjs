// Real Implementation Security & Integration Verification
// Tests actual Edge Function handlers (check-answer, finish-exam) and migrations
// Run with: npx tsx scripts/test-stage0-security.mjs

import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { handleCheckAnswer, normalizeInputAnswer, numericMatch } from '../supabase/functions/check-answer/index.ts';
import { handleFinishExam } from '../supabase/functions/finish-exam/index.ts';
import { handleExplainMistake } from '../supabase/functions/explain-mistake/index.ts';

console.log('🧪 Starting Edge Function Handler Logic & Async Flow Verification (In-Memory Mock DB)...\n');
console.log('NOTE: These 18 tests rigorously prove handler validation, snapshot binding, fail-closed security,');
console.log('and async state flow. Live PostgreSQL ACID engine row-level locks are verified via test-postgres-concurrency.\n');

// =========================================================================
// IN-MEMORY DATABASE HARNESS FOR EDGE FUNCTION TESTING
// =========================================================================

function createMockDatabase() {
  const assigned50Ids = ['q-mc-1', ...Array.from({ length: 49 }, (_, i) => `q-assigned-${i + 2}`)];

  const tables = {
    profiles: [
      { id: 'user-alice-111', full_name: 'Alice User', is_admin: false, subscription_tier: 'free' },
      { id: 'user-bob-222', full_name: 'Bob User', is_admin: false, subscription_tier: 'free' },
      { id: 'user-pro-333', full_name: 'Pro User', is_admin: false, subscription_tier: 'pro' },
      { id: 'user-admin-444', full_name: 'Admin User', is_admin: true, subscription_tier: 'free' },
    ],
    courses: [
      { id: 'course-inf-001', exam_duration_minutes: 120 }
    ],
    diagnostic_attempts: [
      {
        id: 'diag-attempt-alice',
        user_id: 'user-alice-111',
        course_id: 'course-inf-001',
        question_ids: ['q-mc-1', 'q-mc-2', 'q-input-1'],
        started_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        finished_at: null,
        total_score: null,
        results_by_domain: null,
        recommendations: null
      },
      {
        id: 'diag-attempt-50q',
        user_id: 'user-alice-111',
        course_id: 'course-inf-001',
        question_ids: assigned50Ids,
        started_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        finished_at: null,
        total_score: null,
        results_by_domain: null,
        recommendations: null
      },
      {
        id: 'diag-attempt-completed',
        user_id: 'user-alice-111',
        course_id: 'course-inf-001',
        question_ids: ['q-mc-1', 'q-mc-2'],
        started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        finished_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        total_score: 80,
        results_by_domain: { 'Dasturlash': { correct: 4, total: 5, percentage: 80 } },
        recommendations: 'Ajoyib natija!'
      }
    ],
    exam_attempts: [
      {
        id: 'exam-attempt-alice',
        user_id: 'user-alice-111',
        mock_exam_id: 'mock-101',
        course_id: 'course-inf-001',
        started_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        finished_at: null,
        total_score: null,
        domain_scores: null,
        answers_review: null
      }
    ],
    mock_exam_questions: [
      {
        mock_exam_id: 'mock-101',
        question_id: 'q-exam-1',
        question: {
          id: 'q-exam-1',
          domain: 'Dasturlash',
          question_type: 'single',
          explanation_uz: 'Exam Q1',
          question_bank_translations: [
            { question_text: 'Opt B is correct', options: [{ text: 'Opt A' }, { text: 'Opt B', is_correct: true }] }
          ]
        }
      },
      {
        mock_exam_id: 'mock-101',
        question_id: 'q-exam-2',
        question: {
          id: 'q-exam-2',
          domain: 'Dasturlash',
          question_type: 'single',
          explanation_uz: 'Exam Q2',
          question_bank_translations: [
            { question_text: 'Opt A is correct', options: [{ text: 'Opt A', is_correct: true }, { text: 'Opt B' }] }
          ]
        }
      }
    ],
    exam_answers: [
      { attempt_id: 'exam-attempt-alice', question_id: 'q-exam-1', user_answer: 1, is_correct: false, points_earned: 0 },
      { attempt_id: 'exam-attempt-alice', question_id: 'q-exam-2', user_answer: 0, is_correct: false, points_earned: 0 }
    ],
    question_keys: [
      {
        question_id: 'q-mc-1',
        key: { type: 'single', correct_index: 2, correct_text: 'Option C' }
      },
      {
        question_id: 'q-mc-2',
        key: { type: 'single', correct_index: 0, correct_text: 'Option A' }
      },
      {
        question_id: 'q-input-1',
        key: { type: 'input', expected_answer: '11001', correct_text: '11001' }
      },
      {
        question_id: 'q-exam-1',
        key: { type: 'single', correct_index: 1, correct_text: 'Exam Opt B' }
      },
      {
        question_id: 'q-exam-2',
        key: { type: 'single', correct_index: 0, correct_text: 'Exam Opt A' }
      },
      {
        question_id: 'q-foreign-history',
        key: { type: 'single', correct_index: 1, correct_text: 'Amir Temur' }
      },
      ...Array.from({ length: 49 }, (_, i) => ({
        question_id: `q-assigned-${i + 2}`,
        key: { type: 'single', correct_index: 0, correct_text: `Assigned Q${i + 2} Option A` }
      }))
    ],
    question_bank: [
      { id: 'q-mc-1', course_id: 'course-inf-001', domain: 'Dasturlash', explanation_uz: 'Explanation for Q1' },
      { id: 'q-mc-2', course_id: 'course-inf-001', domain: 'Dasturlash', explanation_uz: 'Explanation for Q2' },
      { id: 'q-input-1', course_id: 'course-inf-001', domain: 'Sanoq sistemalari', explanation_uz: 'Explanation for Input Q' },
      { id: 'q-exam-1', course_id: 'course-inf-001', domain: 'Dasturlash', explanation_uz: 'Exam Q1' },
      { id: 'q-exam-2', course_id: 'course-inf-001', domain: 'Dasturlash', explanation_uz: 'Exam Q2' },
      { id: 'q-foreign-history', course_id: 'course-history-999', domain: 'Oʻzbekiston tarixi', explanation_uz: 'Tarix savoli' },
      { id: 'q-broken-key', course_id: 'course-inf-001', domain: 'Dasturlash', explanation_uz: 'Broken question without key' },
      ...Array.from({ length: 49 }, (_, i) => ({
        id: `q-assigned-${i + 2}`,
        course_id: 'course-inf-001',
        domain: 'Dasturlash',
        explanation_uz: `Assigned Q${i + 2} Expl`
      }))
    ],
    question_bank_translations: [
      {
        question_id: 'q-mc-1',
        locale: 'uz',
        options: [{ text: 'Option A' }, { text: 'Option B' }, { text: 'Option C', is_correct: true }]
      },
      {
        question_id: 'q-mc-2',
        locale: 'uz',
        options: [{ text: 'Option A', is_correct: true }, { text: 'Option B' }]
      },
      {
        question_id: 'q-input-1',
        locale: 'uz',
        options: []
      },
      {
        question_id: 'q-exam-1',
        locale: 'uz',
        options: [{ text: 'Opt A' }, { text: 'Opt B', is_correct: true }]
      },
      {
        question_id: 'q-exam-2',
        locale: 'uz',
        options: [{ text: 'Opt A', is_correct: true }, { text: 'Opt B' }]
      },
      {
        question_id: 'q-foreign-history',
        locale: 'uz',
        options: [{ text: 'Javob A' }, { text: 'Amir Temur', is_correct: true }]
      },
      {
        question_id: 'q-broken-key',
        locale: 'uz',
        options: [{ text: 'Opt 1', is_correct: false }, { text: 'Opt 2', is_correct: false }]
      },
      ...Array.from({ length: 49 }, (_, i) => ({
        question_id: `q-assigned-${i + 2}`,
        locale: 'uz',
        options: [{ text: 'Opt A', is_correct: true }, { text: 'Opt B' }]
      }))
    ],
    quiz_attempts: [],
    ai_explanations: []
  };

  let failUpdateOnTable = null;

  function createQueryBuilder(table) {
    let rows = [...(tables[table] || [])];
    const eqFilters = [];
    const isFilters = [];
    const inFilters = [];
    let selectedCols = null;
    let singleMode = false;
    let maybeSingleMode = false;
    let countOnly = false;
    let countType = null;
    let updates = null;
    let inserts = null;
    let upserts = null;
    let upsertOpts = null;

    const builder = {
      select(cols = '*', opts = {}) {
        selectedCols = cols;
        if (opts.head && opts.count) {
          countOnly = true;
          countType = opts.count;
        }
        return builder;
      },
      eq(col, val) {
        eqFilters.push({ col, val });
        rows = rows.filter(r => r[col] === val);
        return builder;
      },
      is(col, val) {
        isFilters.push({ col, val });
        rows = rows.filter(r => r[col] === val);
        return builder;
      },
      in(col, vals) {
        const set = new Set(vals);
        inFilters.push({ col, set });
        rows = rows.filter(r => set.has(r[col]));
        return builder;
      },
      gte(col, val) {
        rows = rows.filter(r => r[col] >= val);
        return builder;
      },
      not(col, op, val) {
        if (op === 'is') {
          rows = rows.filter(r => r[col] !== val);
        }
        return builder;
      },
      order(col, opts = {}) {
        return builder;
      },
      limit(n) {
        rows = rows.slice(0, n);
        return builder;
      },
      single() {
        singleMode = true;
        return builder;
      },
      maybeSingle() {
        maybeSingleMode = true;
        return builder;
      },
      update(patch) {
        updates = patch;
        return builder;
      },
      insert(records) {
        inserts = Array.isArray(records) ? records : [records];
        return builder;
      },
      upsert(records, opts = {}) {
        upserts = Array.isArray(records) ? records : [records];
        upsertOpts = opts;
        return builder;
      },
      async then(resolve) {
        if (failUpdateOnTable === table && updates) {
          return resolve({ data: null, error: new Error('Simulated database write failure') });
        }

        if (inserts) {
          const tableList = tables[table] || [];
          for (const item of inserts) {
            tableList.push({ ...item });
          }
          return resolve({ data: inserts, error: null });
        }

        if (upserts) {
          const tableList = tables[table] || [];
          for (const item of upserts) {
            let conflictCols = ['id'];
            if (upsertOpts?.onConflict) {
              conflictCols = upsertOpts.onConflict.split(',').map(c => c.trim());
            }
            const existingIdx = tableList.findIndex(r => conflictCols.every(c => r[c] === item[c]));
            if (existingIdx >= 0) {
              tableList[existingIdx] = { ...tableList[existingIdx], ...item };
            } else {
              tableList.push({ ...item });
            }
          }
          return resolve({ data: upserts, error: null });
        }

        if (updates) {
          // Re-evaluate predicates against current live database state to simulate atomic row-level lock
          const tableList = tables[table] || [];
          const updatedRows = [];
          for (let i = 0; i < tableList.length; i++) {
            const row = tableList[i];
            const matchesEq = eqFilters.every(f => row[f.col] === f.val);
            const matchesIs = isFilters.every(f => row[f.col] === f.val);
            const matchesIn = inFilters.every(f => f.set.has(row[f.col]));
            if (matchesEq && matchesIs && matchesIn) {
              tableList[i] = { ...tableList[i], ...updates };
              updatedRows.push(tableList[i]);
            }
          }
          const data = (singleMode || maybeSingleMode) ? (updatedRows[0] || null) : updatedRows;
          return resolve({ data, error: null });
        }

        if (countOnly) {
          return resolve({ count: rows.length, data: null, error: null });
        }

        if (singleMode) {
          if (rows.length === 0) return resolve({ data: null, error: new Error('Row not found') });
          return resolve({ data: rows[0], error: null });
        }

        if (maybeSingleMode) {
          return resolve({ data: rows[0] || null, error: null });
        }

        return resolve({ data: rows, error: null });
      }
    };
    return builder;
  }

  return {
    tables,
    setFailUpdate(tableName) {
      failUpdateOnTable = tableName;
    },
    from(table) {
      return createQueryBuilder(table);
    }
  };
}

function mockClientFactory(mockDb, defaultUserId = 'user-alice-111') {
  return function(url, key, opts) {
    const authHeader = opts?.global?.headers?.Authorization || '';
    let currentUserId = defaultUserId;
    if (authHeader.includes('token-pro') || authHeader.includes('user-pro-333')) {
      currentUserId = 'user-pro-333';
    } else if (authHeader.includes('token-admin') || authHeader.includes('user-admin-444')) {
      currentUserId = 'user-admin-444';
    } else if (authHeader.includes('token-bob') || authHeader.includes('user-bob-222')) {
      currentUserId = 'user-bob-222';
    } else if (authHeader.includes('unauthenticated') || authHeader === '') {
      currentUserId = null;
    }

    return {
      auth: {
        async getUser() {
          if (!currentUserId) {
            return { data: { user: null }, error: new Error('Invalid or missing authentication token') };
          }
          return { data: { user: { id: currentUserId } }, error: null };
        }
      },
      from(table) {
        return mockDb.from(table);
      }
    };
  };
}

async function runTests() {
  // =========================================================================
  // TEST 1: Unauthenticated batch rejected
  // =========================================================================
  console.log('Test 1: Batch grading without attempt_id rejected (400)...');
  const mockDb1 = createMockDatabase();
  const req1 = new Request('http://localhost/check-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
    body: JSON.stringify({
      batch: [{ question_id: 'q-mc-1', user_answer: 0 }]
    })
  });
  const res1 = await handleCheckAnswer(req1, {
    createClient: mockClientFactory(mockDb1),
    userOverride: { id: 'user-alice-111' }
  });
  assert.strictEqual(res1.status, 400, 'Batch without attempt_id must return 400');
  const body1 = await res1.json();
  assert.ok(body1.error.includes('attempt_id'), 'Must state attempt_id required');
  console.log('  ✓ Arbitrary batch without attempt ID correctly rejected.');

  // =========================================================================
  // TEST 2: Cross-user attempt rejected
  // =========================================================================
  console.log('\nTest 2: Batch grading with attempt belonging to another user rejected (403)...');
  const mockDb2 = createMockDatabase();
  const req2 = new Request('http://localhost/check-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
    body: JSON.stringify({
      diagnostic_attempt_id: 'diag-attempt-alice',
      batch: [{ question_id: 'q-mc-1', user_answer: 2 }]
    })
  });
  const res2 = await handleCheckAnswer(req2, {
    createClient: mockClientFactory(mockDb2),
    userOverride: { id: 'user-bob-222' } // Bob trying to submit Alice's attempt
  });
  assert.strictEqual(res2.status, 403, 'Cross-user attempt must return 403');
  console.log('  ✓ Cross-user attempt submission blocked.');

  // =========================================================================
  // TEST 3: Duplicate question IDs rejected
  // =========================================================================
  console.log('\nTest 3: Batch with duplicate question IDs rejected (400)...');
  const mockDb3 = createMockDatabase();
  const req3 = new Request('http://localhost/check-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
    body: JSON.stringify({
      diagnostic_attempt_id: 'diag-attempt-alice',
      batch: [
        { question_id: 'q-mc-1', user_answer: 2 },
        { question_id: 'q-mc-1', user_answer: 2 } // DUPLICATE
      ]
    })
  });
  const res3 = await handleCheckAnswer(req3, {
    createClient: mockClientFactory(mockDb3),
    userOverride: { id: 'user-alice-111' }
  });
  assert.strictEqual(res3.status, 400, 'Duplicate question IDs must return 400');
  const body3 = await res3.json();
  assert.ok(body3.error.includes('Takroriy') || body3.error.includes('Duplicate'), 'Must mention duplicate rejection');
  console.log('  ✓ Duplicate question ID attack blocked.');

  // =========================================================================
  // TEST 4: Foreign course question rejected
  // =========================================================================
  console.log('\nTest 4: Batch with foreign course question rejected (400)...');
  const mockDb4 = createMockDatabase();
  const req4 = new Request('http://localhost/check-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
    body: JSON.stringify({
      diagnostic_attempt_id: 'diag-attempt-alice',
      batch: [
        { question_id: 'q-mc-1', user_answer: 2 },
        { question_id: 'q-foreign-history', user_answer: 1 } // Belongs to History course, not Informatics
      ]
    })
  });
  const res4 = await handleCheckAnswer(req4, {
    createClient: mockClientFactory(mockDb4),
    userOverride: { id: 'user-alice-111' }
  });
  assert.strictEqual(res4.status, 400, 'Foreign course question must return 400');
  const body4 = await res4.json();
  assert.ok(body4.error.includes('biriktirilmagan') || body4.error.includes('tegishli emas') || body4.error.includes('kursiga mos kelmaydi') || body4.error.includes('course'), 'Must reject foreign course question');
  console.log('  ✓ Foreign course question injection blocked.');

  // =========================================================================
  // TEST 5: Non-existent question ID rejected
  // =========================================================================
  console.log('\nTest 5: Batch with non-existent question ID rejected (400)...');
  const mockDb5 = createMockDatabase();
  const req5 = new Request('http://localhost/check-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
    body: JSON.stringify({
      diagnostic_attempt_id: 'diag-attempt-alice',
      batch: [
        { question_id: 'q-mc-1', user_answer: 2 },
        { question_id: 'q-non-existent-999', user_answer: 0 }
      ]
    })
  });
  const res5 = await handleCheckAnswer(req5, {
    createClient: mockClientFactory(mockDb5),
    userOverride: { id: 'user-alice-111' }
  });
  assert.strictEqual(res5.status, 400, 'Non-existent question ID must return 400');
  console.log('  ✓ Non-existent question ID rejected.');

  // =========================================================================
  // TEST 6: Batch exceeding question bounds (>50) rejected
  // =========================================================================
  console.log('\nTest 6: Batch exceeding bounds (>50) rejected (400)...');
  const mockDb6 = createMockDatabase();
  const hugeBatch = Array.from({ length: 51 }, (_, i) => ({
    question_id: `q-overflow-${i}`,
    user_answer: 0
  }));
  const req6 = new Request('http://localhost/check-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
    body: JSON.stringify({
      diagnostic_attempt_id: 'diag-attempt-alice',
      batch: hugeBatch
    })
  });
  const res6 = await handleCheckAnswer(req6, {
    createClient: mockClientFactory(mockDb6),
    userOverride: { id: 'user-alice-111' }
  });
  assert.strictEqual(res6.status, 400, 'Batch > 50 must return 400');
  console.log('  ✓ Batch overflow rejected.');

  // =========================================================================
  // TEST 7: Replay / completed attempt does NOT grade or reveal new questions
  // =========================================================================
  console.log('\nTest 7: Completed attempt replay returns saved result and ignores new questions...');
  const mockDb7 = createMockDatabase();
  const req7 = new Request('http://localhost/check-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
    body: JSON.stringify({
      diagnostic_attempt_id: 'diag-attempt-completed',
      batch: [
        { question_id: 'q-mc-1', user_answer: 0 }
      ]
    })
  });
  const res7 = await handleCheckAnswer(req7, {
    createClient: mockClientFactory(mockDb7),
    userOverride: { id: 'user-alice-111' }
  });
  assert.strictEqual(res7.status, 200);
  const body7 = await res7.json();
  assert.strictEqual(body7.already_completed, true);
  assert.strictEqual(body7.total_score, 80, 'Must return previously saved score of 80');
  assert.strictEqual(body7.results, undefined, 'Must NOT reveal results or correct answers on completed replay');
  console.log('  ✓ Completed attempt idempotently returns saved result without leaking keys.');

  // =========================================================================
  // TEST 8: Missing question key fails closed (500)
  // =========================================================================
  console.log('\nTest 8: Missing question key fails closed with 500...');
  const mockDb8 = createMockDatabase();
  mockDb8.tables.diagnostic_attempts.push({
    id: 'diag-attempt-broken',
    user_id: 'user-alice-111',
    course_id: 'course-inf-001',
    question_ids: ['q-mc-1', 'q-broken-key'],
    finished_at: null,
    started_at: new Date().toISOString()
  });
  const req8 = new Request('http://localhost/check-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
    body: JSON.stringify({
      diagnostic_attempt_id: 'diag-attempt-broken',
      batch: [
        { question_id: 'q-mc-1', user_answer: 2 },
        { question_id: 'q-broken-key', user_answer: 0 }
      ]
    })
  });
  const res8 = await handleCheckAnswer(req8, {
    createClient: mockClientFactory(mockDb8),
    userOverride: { id: 'user-alice-111' }
  });
  assert.strictEqual(res8.status, 500, 'Missing key must throw 500');
  console.log('  ✓ Missing key fails closed without falsifying scores.');

  // =========================================================================
  // TEST 9: Empty string and null are not coerced to 0
  // =========================================================================
  console.log('\nTest 9: Empty string and null are not coerced to 0...');
  const mockDb9 = createMockDatabase();
  const req9Empty = new Request('http://localhost/check-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
    body: JSON.stringify({ question_id: 'q-mc-2', user_answer: '' }) // q-mc-2 has correct_index = 0
  });
  const res9Empty = await handleCheckAnswer(req9Empty, {
    createClient: mockClientFactory(mockDb9),
    userOverride: { id: 'user-alice-111' }
  });
  const body9Empty = await res9Empty.json();
  assert.strictEqual(body9Empty.is_correct, false, 'Empty string must NOT match option 0');

  const req9Null = new Request('http://localhost/check-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
    body: JSON.stringify({ question_id: 'q-mc-2', user_answer: null })
  });
  const res9Null = await handleCheckAnswer(req9Null, {
    createClient: mockClientFactory(mockDb9),
    userOverride: { id: 'user-alice-111' }
  });
  const body9Null = await res9Null.json();
  assert.strictEqual(body9Null.is_correct, false, 'Null must NOT match option 0');
  console.log('  ✓ No false positives on empty or null answers.');

  // =========================================================================
  // TEST 10: Valid diagnostic batch graded atomically
  // =========================================================================
  console.log('\nTest 10: Valid diagnostic batch graded atomically with .is(finished_at, null)...');
  const mockDb10 = createMockDatabase();
  const req10 = new Request('http://localhost/check-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' },
    body: JSON.stringify({
      diagnostic_attempt_id: 'diag-attempt-alice',
      batch: [
        { question_id: 'q-mc-1', user_answer: 2 }, // correct (Option C)
        { question_id: 'q-mc-2', user_answer: 0 }, // correct (Option A)
        { question_id: 'q-input-1', user_answer: '11001' } // correct
      ]
    })
  });
  const res10 = await handleCheckAnswer(req10, {
    createClient: mockClientFactory(mockDb10),
    userOverride: { id: 'user-alice-111' }
  });
  if (res10.status !== 200) {
    const errBody = await res10.json();
    console.error('Test 10 unexpected response:', res10.status, errBody);
  }
  assert.strictEqual(res10.status, 200);
  const body10 = await res10.json();
  assert.strictEqual(body10.total_score, 100, '3 of 3 correct answers = 100%');
  const savedRow10 = mockDb10.tables.diagnostic_attempts.find(a => a.id === 'diag-attempt-alice');
  assert.notStrictEqual(savedRow10.finished_at, null);
  assert.strictEqual(savedRow10.total_score, 100);
  console.log('  ✓ Diagnostic attempt completed and scored atomically.');

  // =========================================================================
  // TEST 11: Real Concurrency with DIFFERENT answers (Diagnostic race condition)
  // =========================================================================
  console.log('\nTest 11: Concurrent simultaneous diagnostic completions with DIFFERENT answers...');
  const mockDbConcurrent = createMockDatabase();

  // Client 1 sends high-scoring answers (score 4: 2 correct)
  const reqClient1 = new Request('http://localhost/check-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token-alice' },
    body: JSON.stringify({
      diagnostic_attempt_id: 'diag-attempt-alice',
      batch: [
        { question_id: 'q-mc-1', user_answer: 2 }, // correct
        { question_id: 'q-mc-2', user_answer: 0 }  // correct
      ]
    })
  });

  // Client 2 sends wrong answers (score 0: 0 correct) simultaneously
  const reqClient2 = new Request('http://localhost/check-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token-alice' },
    body: JSON.stringify({
      diagnostic_attempt_id: 'diag-attempt-alice',
      batch: [
        { question_id: 'q-mc-1', user_answer: 0 }, // wrong
        { question_id: 'q-mc-2', user_answer: 1 }  // wrong
      ]
    })
  });

  const [resConcurrent1, resConcurrent2] = await Promise.all([
    handleCheckAnswer(reqClient1, {
      createClient: mockClientFactory(mockDbConcurrent),
      userOverride: { id: 'user-alice-111' }
    }),
    handleCheckAnswer(reqClient2, {
      createClient: mockClientFactory(mockDbConcurrent),
      userOverride: { id: 'user-alice-111' }
    })
  ]);

  assert.strictEqual(resConcurrent1.status, 200);
  assert.strictEqual(resConcurrent2.status, 200);
  const bodyC1 = await resConcurrent1.json();
  const bodyC2 = await resConcurrent2.json();

  // Exactly one result is saved in DB
  const committedDiag = mockDbConcurrent.tables.diagnostic_attempts.find(a => a.id === 'diag-attempt-alice');
  assert.notStrictEqual(committedDiag.finished_at, null, 'Must be marked finished');
  
  // Both clients must receive the committed total_score
  assert.strictEqual(committedDiag.total_score, bodyC1.total_score, 'Client 1 score matches DB');
  assert.strictEqual(committedDiag.total_score, bodyC2.total_score, 'Client 2 score matches DB');
  
  // One of them is the winner, the other is already_completed
  const winnerBody = bodyC1.already_completed ? bodyC2 : bodyC1;
  const loserBody = bodyC1.already_completed ? bodyC1 : bodyC2;
  assert.strictEqual(loserBody.already_completed, true, 'Losing request must return already_completed: true');
  assert.strictEqual(loserBody.results, undefined, 'Losing request must NOT receive uncommitted results');
  console.log(`  ✓ Concurrent diagnostic race safely resolved. Single committed score: ${committedDiag.total_score}.`);

  // =========================================================================
  // TEST 12: Real Concurrency with finish-exam
  // =========================================================================
  console.log('\nTest 12: Concurrent simultaneous finish-exam executions...');
  const mockDbExam = createMockDatabase();

  const reqExam1 = new Request('http://localhost/finish-exam', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token-alice' },
    body: JSON.stringify({ attempt_id: 'exam-attempt-alice' })
  });

  const reqExam2 = new Request('http://localhost/finish-exam', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token-alice' },
    body: JSON.stringify({ attempt_id: 'exam-attempt-alice' })
  });

  const [resExam1, resExam2] = await Promise.all([
    handleFinishExam(reqExam1, {
      createClient: mockClientFactory(mockDbExam),
      userOverride: { id: 'user-alice-111' }
    }),
    handleFinishExam(reqExam2, {
      createClient: mockClientFactory(mockDbExam),
      userOverride: { id: 'user-alice-111' }
    })
  ]);

  assert.strictEqual(resExam1.status, 200);
  assert.strictEqual(resExam2.status, 200);
  const examBody1 = await resExam1.json();
  const examBody2 = await resExam2.json();

  const committedExam = mockDbExam.tables.exam_attempts.find(a => a.id === 'exam-attempt-alice');
  assert.notStrictEqual(committedExam.finished_at, null);
  assert.strictEqual(committedExam.total_score, examBody1.score);
  assert.strictEqual(committedExam.total_score, examBody2.score);

  const examWinner = examBody1.already_completed ? examBody2 : examBody1;
  const examLoser = examBody1.already_completed ? examBody1 : examBody2;
  assert.strictEqual(examLoser.already_completed, true);
  console.log(`  ✓ Concurrent finish-exam safely resolved. Single committed score: ${committedExam.total_score}%.`);

  // =========================================================================
  // TEST 13: Database write failure fails closed (500)
  // =========================================================================
  console.log('\nTest 13: Database write failure does not leak answers or claim success...');
  const mockDbFail = createMockDatabase();
  mockDbFail.setFailUpdate('diagnostic_attempts');

  const reqFail = new Request('http://localhost/check-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token-alice' },
    body: JSON.stringify({
      diagnostic_attempt_id: 'diag-attempt-alice',
      batch: [
        { question_id: 'q-mc-1', user_answer: 2 }
      ]
    })
  });

  const resFail = await handleCheckAnswer(reqFail, {
    createClient: mockClientFactory(mockDbFail),
    userOverride: { id: 'user-alice-111' }
  });
  assert.strictEqual(resFail.status, 500, 'DB write failure must return 500');
  const bodyFail = await resFail.json();
  assert.strictEqual(bodyFail.results, undefined, 'Must NOT disclose results on write failure');
  console.log('  ✓ Write failure safely handled without leaking answers.');

  // =========================================================================
  // TEST 14: SQL Migration A & B assertion verifications
  // =========================================================================
  console.log('\nTest 14: SQL Migration assertions review...');
  const migAPath = resolve(process.cwd(), 'supabase/migrations/20261115100000_stage0_question_keys_non_destructive.sql');
  const migBPath = resolve(process.cwd(), 'supabase/migrations/20261115200000_stage0_strip_answers_destructive.sql');
  const migAContent = readFileSync(migAPath, 'utf8');
  const migBContent = readFileSync(migBPath, 'utf8');

  // Verify Migration A transactional safety
  assert.ok(migAContent.includes('BEGIN;') && migAContent.includes('COMMIT;'), 'Migration A must be transactional');
  assert.ok(migAContent.includes('RAISE EXCEPTION') && migAContent.includes('correct_count <> 1'), 'Migration A must abort on ambiguous answers');
  assert.ok(!migAContent.includes('correct_idx := 0;'), 'Migration A must NOT fallback to option 0');

  // Verify Migration B transactional safety and non-destructive jsonb cleaning
  assert.ok(migBContent.includes('BEGIN;') && migBContent.includes('COMMIT;'), 'Migration B must be transactional');
  assert.ok(migBContent.includes("opt - 'is_correct'"), 'Migration B must only remove is_correct key');
  assert.ok(migBContent.includes('k.question_id IS NULL'), 'Migration B must pre-check that all questions have keys in question_keys');
  assert.ok(migBContent.includes('leaked_count > 0'), 'Migration B must assert 0 leaked keys remain');
  console.log('  ✓ Migration A & B SQL files contain all required transactional and fail-closed guards.');

  // =========================================================================
  // TEST 15: Question swap rejected (400) - Attempt-bound validation
  // =========================================================================
  console.log('\nTest 15: Swapping question for another in the same course rejected (400)...');
  const mockDb15 = createMockDatabase();
  // diag-attempt-alice has assigned question_ids: ['q-mc-1', 'q-mc-2', 'q-input-1']
  // Attacker tries to swap q-input-1 with q-assigned-10 (which belongs to course-inf-001)
  const req15 = new Request('http://localhost/check-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token-alice' },
    body: JSON.stringify({
      diagnostic_attempt_id: 'diag-attempt-alice',
      batch: [
        { question_id: 'q-mc-1', user_answer: 2 },
        { question_id: 'q-mc-2', user_answer: 0 },
        { question_id: 'q-assigned-10', user_answer: 0 } // Belongs to same course, but NOT in assigned question_ids!
      ]
    })
  });
  const res15 = await handleCheckAnswer(req15, {
    createClient: mockClientFactory(mockDb15),
    userOverride: { id: 'user-alice-111' }
  });
  assert.strictEqual(res15.status, 400, 'Swapped question not in attempt snapshot must return 400');
  const body15 = await res15.json();
  assert.ok(body15.error.includes('biriktirilmagan'), 'Must explain question is not assigned to attempt');
  console.log('  ✓ Question swap prevented: only assigned questions allowed.');

  // =========================================================================
  // TEST 16: Single-question submission to 50-question attempt maintains fixed denominator
  // =========================================================================
  console.log('\nTest 16: Submitting 1 answer to 50-question diagnostic scores 2/100 (fixed denominator)...');
  const mockDb16 = createMockDatabase();
  // diag-attempt-50q has 50 assigned questions. Attacker sends only 1 correct answer.
  const req16 = new Request('http://localhost/check-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token-alice' },
    body: JSON.stringify({
      diagnostic_attempt_id: 'diag-attempt-50q',
      batch: [
        { question_id: 'q-mc-1', user_answer: 2 } // 1 correct answer
      ]
    })
  });
  const res16 = await handleCheckAnswer(req16, {
    createClient: mockClientFactory(mockDb16),
    userOverride: { id: 'user-alice-111' }
  });
  assert.strictEqual(res16.status, 200);
  const body16 = await res16.json();
  // Score must be calculated against the 50 assigned questions: 1 / 50 * 100 = 2%
  assert.strictEqual(body16.total_score, 2, 'Score must be 2 points out of 100, NOT 100 points!');
  const savedRow16 = mockDb16.tables.diagnostic_attempts.find(a => a.id === 'diag-attempt-50q');
  assert.strictEqual(savedRow16.total_score, 2);
  console.log('  ✓ Denominator strictly preserved: partial batch scored against total assigned snapshot.');

  // =========================================================================
  // TEST 17: Extra unassigned question ID rejected (400)
  // =========================================================================
  console.log('\nTest 17: Extra question ID not in attempt snapshot rejected (400)...');
  const mockDb17 = createMockDatabase();
  const req17 = new Request('http://localhost/check-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token-alice' },
    body: JSON.stringify({
      diagnostic_attempt_id: 'diag-attempt-alice',
      batch: [
        { question_id: 'q-mc-1', user_answer: 2 },
        { question_id: 'q-mc-2', user_answer: 0 },
        { question_id: 'q-input-1', user_answer: '11001' },
        { question_id: 'q-extra-id-99', user_answer: 1 } // Extra ID
      ]
    })
  });
  const res17 = await handleCheckAnswer(req17, {
    createClient: mockClientFactory(mockDb17),
    userOverride: { id: 'user-alice-111' }
  });
  assert.strictEqual(res17.status, 400, 'Extra unassigned question ID must return 400');
  console.log('  ✓ Extra question IDs rejected.');

  // =========================================================================
  // TEST 18: Server-side AI Mentor Gating in explain-mistake
  // =========================================================================
  console.log('\nTest 18: Server-side AI Mentor entitlement gating in explain-mistake...');
  const mockDb18 = createMockDatabase();

  // 18a: Unauthenticated request -> 401
  const req18Anon = new Request('http://localhost/explain-mistake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer unauthenticated' },
    body: JSON.stringify({ question_id: 'q-mc-1', user_answer_index: 0 })
  });
  const res18Anon = await handleExplainMistake(req18Anon, {
    createClient: mockClientFactory(mockDb18)
  });
  assert.strictEqual(res18Anon.status, 401, 'Unauthenticated explain-mistake must return 401');

  // 18b: Free tier user -> 403 Forbidden with { locked: true }
  const req18Free = new Request('http://localhost/explain-mistake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token-alice' },
    body: JSON.stringify({ question_id: 'q-mc-1', user_answer_index: 0 })
  });
  const res18Free = await handleExplainMistake(req18Free, {
    createClient: mockClientFactory(mockDb18)
  });
  assert.strictEqual(res18Free.status, 403, 'Free tier user must be rejected with 403');
  const body18Free = await res18Free.json();
  assert.strictEqual(body18Free.locked, true, 'Response must indicate locked: true');

  // 18c: Pro tier user -> 200 OK
  const req18Pro = new Request('http://localhost/explain-mistake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token-pro' },
    body: JSON.stringify({ question_id: 'q-mc-1', user_answer_index: 0 })
  });
  const res18Pro = await handleExplainMistake(req18Pro, {
    createClient: mockClientFactory(mockDb18)
  });
  assert.strictEqual(res18Pro.status, 200, 'Pro tier user must be permitted (200)');
  const body18Pro = await res18Pro.json();
  assert.ok(body18Pro.explanation, 'Pro tier receives explanation');

  // 18d: Admin user -> 200 OK
  const req18Admin = new Request('http://localhost/explain-mistake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token-admin' },
    body: JSON.stringify({ question_id: 'q-mc-1', user_answer_index: 0 })
  });
  const res18Admin = await handleExplainMistake(req18Admin, {
    createClient: mockClientFactory(mockDb18)
  });
  assert.strictEqual(res18Admin.status, 200, 'Admin user must be permitted (200)');
  console.log('  ✓ Server-side AI Mentor gating strictly enforced: 401 anon, 403 free (locked), 200 Pro/Admin.');

  console.log('\n======================================================');
  console.log('🎉 ALL 18 HANDLER LOGIC & SECURITY FLOW TESTS PASSED.');
  console.log('======================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
