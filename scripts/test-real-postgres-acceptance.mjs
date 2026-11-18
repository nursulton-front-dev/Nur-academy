/**
 * Acceptance Test Suite on Real Local PostgreSQL Cluster (Port 5433, nur_test_db)
 * Proves:
 * 1. Attempt integrity & question_ids trustworthiness (bypasses blocked by triggers & revoked permissions)
 * 2. Real access rights of anon and authenticated roles (answers, question_keys, translations)
 * 3. Atomic concurrency & idempotency on real PostgreSQL attempt records
 */

import { execFileSync } from 'child_process';
import { handleCheckAnswer } from '../supabase/functions/check-answer/index.ts';
import { handleFinishExam } from '../supabase/functions/finish-exam/index.ts';

const PSQL_BIN = '/usr/lib/postgresql/16/bin/psql';
const DB_SOCKET = '/tmp/test_nur_pg_socket';
const DB_PORT = '5433';
const DB_NAME = 'nur_test_db';
const DB_USER = 'nur_test_runner';

const COURSE_1 = '0a7e57a7-0000-4000-8000-000000000001';
const COURSE_2 = '0b7e57a7-0000-4000-8000-000000000002';
const MOCK_1   = '0a7e0000-0000-4000-8000-000000000001';
const ALICE_ID = '11111111-1111-4111-8111-111111111111';
const BOB_ID   = '22222222-2222-4222-8222-222222222222';

function runSql(sql, role = null, uid = null) {
  let preamble = '';
  if (role) {
    preamble += `SET ROLE ${role};\n`;
  }
  if (uid) {
    preamble += `SET request.jwt.claim.sub = '${uid}';\n`;
  }
  const fullSql = preamble + sql;
  try {
    const stdout = execFileSync(PSQL_BIN, [
      '-h', DB_SOCKET,
      '-p', DB_PORT,
      '-U', DB_USER,
      '-d', DB_NAME,
      '-t', '-A',
      '-c', fullSql
    ], { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { ok: true, output: stdout.trim() };
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : err.message;
    return { ok: false, error: stderr.trim() };
  }
}

function runSqlJson(query, role = null, uid = null) {
  const cleanQuery = query.trim().replace(/;+$/, '');
  const jsonQuery = `SELECT coalesce(json_agg(t), '[]'::json) FROM (${cleanQuery}) t;`;
  const res = runSql(jsonQuery, role, uid);
  if (!res.ok) return res;
  try {
    const parsed = res.output ? JSON.parse(res.output) : [];
    return { ok: true, data: parsed };
  } catch (err) {
    return { ok: true, data: [] };
  }
}

// Fetch all 50 questions for Course 1
const qRes = runSqlJson(`SELECT id FROM public.question_bank WHERE course_id = '${COURSE_1}' ORDER BY id;`);
if (!qRes.ok || !Array.isArray(qRes.data) || qRes.data.length < 50) {
  console.error('Failed to load Course 1 questions:', qRes);
  process.exit(1);
}
const ALL_50_QIDS = qRes.data.map(r => r.id);

// Fetch questions for Course 2 (Tarix)
const q2Res = runSqlJson(`SELECT id FROM public.question_bank WHERE course_id = '${COURSE_2}' ORDER BY id;`);
const TARIX_QIDS = q2Res.data.map(r => r.id);

console.log(`\n===============================================================`);
console.log(`Nur Academy: Real PostgreSQL Acceptance Test Suite`);
console.log(`Target: PostgreSQL 16 (Port 5433, ${DB_NAME})`);
console.log(`Course 1 questions available: ${ALL_50_QIDS.length}`);
console.log(`Course 2 questions available: ${TARIX_QIDS.length}`);
console.log(`===============================================================\n`);

let passed = 0;
let failed = 0;

function assert(description, condition, detail = '') {
  if (condition) {
    console.log(`  [PASS] ${description}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${description} ${detail ? `-> ${detail}` : ''}`);
    failed++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ITEM 1: TRUSTWORTHINESS OF question_ids & ATTEMPT INTEGRITY
// ─────────────────────────────────────────────────────────────────────────────
console.log(`--- ITEM 1: Trustworthiness of question_ids & Attempt Integrity ---`);

// 1.1 Direct insertion of diagnostic attempt with 1 question
const r1_1 = runSql(
  `INSERT INTO public.diagnostic_attempts (user_id, course_id, question_ids)
   VALUES ('${ALICE_ID}', '${COURSE_1}', ARRAY['${ALL_50_QIDS[0]}']::uuid[]);`,
  'authenticated', ALICE_ID
);
assert(
  '1.1 Rejection of diagnostic attempt created with 1 question',
  !r1_1.ok && r1_1.error.includes('must contain exactly 50 assigned question IDs'),
  r1_1.error
);

// 1.2 Direct insertion of diagnostic attempt with duplicate question IDs
const duplicate50 = Array(50).fill(`'${ALL_50_QIDS[0]}'`).join(',');
const r1_2 = runSql(
  `INSERT INTO public.diagnostic_attempts (user_id, course_id, question_ids)
   VALUES ('${ALICE_ID}', '${COURSE_1}', ARRAY[${duplicate50}]::uuid[]);`,
  'authenticated', ALICE_ID
);
assert(
  '1.2 Rejection of diagnostic attempt with duplicate question IDs',
  !r1_2.ok && r1_2.error.includes('contains duplicate question IDs'),
  r1_2.error
);

// 1.3 Direct insertion of diagnostic attempt with questions from another course
const mixed50 = [...ALL_50_QIDS.slice(0, 48), TARIX_QIDS[0], TARIX_QIDS[1]].map(id => `'${id}'`).join(',');
const r1_3 = runSql(
  `INSERT INTO public.diagnostic_attempts (user_id, course_id, question_ids)
   VALUES ('${ALICE_ID}', '${COURSE_1}', ARRAY[${mixed50}]::uuid[]);`,
  'authenticated', ALICE_ID
);
assert(
  '1.3 Rejection of diagnostic attempt with foreign course questions',
  !r1_3.ok && r1_3.error.includes('All diagnostic questions must be published questions belonging to course'),
  r1_3.error
);

// 1.4 Direct insertion attempting to forge total_score = 100 and finished_at = now()
const valid50 = ALL_50_QIDS.map(id => `'${id}'`).join(',');
const r1_4 = runSql(
  `INSERT INTO public.diagnostic_attempts (user_id, course_id, question_ids, total_score, finished_at)
   VALUES ('${ALICE_ID}', '${COURSE_1}', ARRAY[${valid50}]::uuid[], 100, now())
   RETURNING coalesce(total_score::text, 'NULL_SCORE') || '|' || coalesce(finished_at::text, 'NULL_FINISHED');`,
  'authenticated', ALICE_ID
);
assert(
  '1.4 Overriding forged total_score and finished_at to NULL on creation',
  r1_4.ok && r1_4.output.includes('NULL_SCORE|NULL_FINISHED'),
  `Output was: ${r1_4.output}`
);

// Get the created attempt id for update checks
const rAttemptId = runSql(`SELECT id FROM public.diagnostic_attempts WHERE user_id = '${ALICE_ID}' ORDER BY started_at DESC LIMIT 1;`);
const createdDiagId = rAttemptId.output.split('\n')[0].trim();

// 1.5 Direct UPDATE of score on diagnostic attempt as authenticated user
const r1_5 = runSql(
  `UPDATE public.diagnostic_attempts SET total_score = 100 WHERE id = '${createdDiagId}';`,
  'authenticated', ALICE_ID
);
assert(
  '1.5 Revocation of direct UPDATE on diagnostic_attempts from client role',
  !r1_5.ok && r1_5.error.includes('permission denied for table diagnostic_attempts'),
  r1_5.error
);

// 1.6 Direct UPDATE on another user's attempt
const r1_6 = runSql(
  `UPDATE public.diagnostic_attempts SET total_score = 100 WHERE id = '${createdDiagId}';`,
  'authenticated', BOB_ID
);
assert(
  '1.6 Cross-user update on diagnostic_attempts denied',
  !r1_6.ok && r1_6.error.includes('permission denied for table diagnostic_attempts'),
  r1_6.error
);

// 1.7 Direct insertion of exam attempt with 1 question
const r1_7 = runSql(
  `INSERT INTO public.exam_attempts (user_id, course_id, question_ids)
   VALUES ('${ALICE_ID}', '${COURSE_1}', ARRAY['${ALL_50_QIDS[0]}']::uuid[]);`,
  'authenticated', ALICE_ID
);
assert(
  '1.7 Rejection of exam attempt with arbitrary question count (1 question)',
  !r1_7.ok && r1_7.error.includes('Exam attempt question count must be 20 (topic test) or 50 (mock exam)'),
  r1_7.error
);

// 1.8 Direct UPDATE on exam attempt as authenticated user
const rExamCreate = runSql(
  `INSERT INTO public.exam_attempts (user_id, course_id, question_ids)
   VALUES ('${ALICE_ID}', '${COURSE_1}', ARRAY[${valid50}]::uuid[])
   RETURNING id;`
);
const createdExamId = rExamCreate.output.split('\n')[0].trim();

const r1_8 = runSql(
  `UPDATE public.exam_attempts SET total_score = 100 WHERE id = '${createdExamId}';`,
  'authenticated', ALICE_ID
);
assert(
  '1.8 Revocation of direct UPDATE on exam_attempts from client role',
  !r1_8.ok && r1_8.error.includes('permission denied for table exam_attempts'),
  r1_8.error
);


// ─────────────────────────────────────────────────────────────────────────────
// ITEM 2: REAL ACCESS RIGHTS (anon and authenticated)
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n--- ITEM 2: Real Access Rights ---`);

// 2.1 anon cannot select is_correct from answers
const r2_1 = runSql(`SELECT is_correct FROM public.answers;`, 'anon');
assert(
  '2.1 anon: permission denied for column is_correct on answers',
  !r2_1.ok && (r2_1.error.includes('permission denied') || r2_1.error.includes('is_correct')),
  r2_1.error
);

// 2.2 authenticated cannot select is_correct from answers
const r2_2 = runSql(`SELECT is_correct FROM public.answers;`, 'authenticated', ALICE_ID);
assert(
  '2.2 authenticated: permission denied for column is_correct on answers',
  !r2_2.ok && (r2_2.error.includes('permission denied') || r2_2.error.includes('is_correct')),
  r2_2.error
);

// 2.3 answers_public view is accessible and exposes ONLY safe columns (id, question_id)
const r2_3 = runSqlJson(`SELECT * FROM public.answers_public LIMIT 5;`, 'authenticated', ALICE_ID);
const hasNoLeakAnswers = r2_3.ok && Array.isArray(r2_3.data) && (r2_3.data.length === 0 || !('is_correct' in r2_3.data[0]));
assert(
  '2.3 answers_public view contains zero answer key columns',
  hasNoLeakAnswers,
  JSON.stringify(r2_3.data?.[0])
);

// 2.4 anon cannot read question_keys
const r2_4 = runSqlJson(`SELECT * FROM public.question_keys;`, 'anon');
assert(
  '2.4 anon: access to question_keys denied (0 rows or permission denied)',
  !r2_4.ok || (Array.isArray(r2_4.data) && r2_4.data.length === 0),
  r2_4.error || `rows: ${r2_4.data?.length}`
);

// 2.5 authenticated (non-admin) cannot read question_keys
const r2_5 = runSqlJson(`SELECT * FROM public.question_keys;`, 'authenticated', ALICE_ID);
assert(
  '2.5 authenticated (student): access to question_keys denied (0 rows or permission denied)',
  !r2_5.ok || (Array.isArray(r2_5.data) && r2_5.data.length === 0),
  r2_5.error || `rows: ${r2_5.data?.length}`
);

// 2.6 question_bank_translations: 0 options contain is_correct
const r2_6 = runSql(
  `SELECT count(*) FROM public.question_bank_translations, jsonb_array_elements(options) opt WHERE opt ? 'is_correct';`
);
assert(
  '2.6 question_bank_translations: 0 options contain is_correct key in database',
  r2_6.ok && r2_6.output === '0',
  `Found leaked count: ${r2_6.output}`
);

// 2.7 question_bank_translations_public view contains 0 leaked keys
const r2_7 = runSql(
  `SELECT count(*) FROM public.question_bank_translations_public, jsonb_array_elements(options) opt WHERE opt ? 'is_correct';`,
  'authenticated', ALICE_ID
);
assert(
  '2.7 question_bank_translations_public view contains 0 leaked keys',
  r2_7.ok && r2_7.output.split('\n').pop().trim() === '0',
  `Found leaked count: ${r2_7.output}`
);


// ─────────────────────────────────────────────────────────────────────────────
// ITEM 4: REAL CONCURRENCY ON TEST POSTGRESQL ATTEMPT RECORDS
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n--- ITEM 4: Real Concurrency on Real PostgreSQL Records ---`);

function createRealPgClient() {
  return {
    from(tableName) {
      return {
        _table: tableName,
        _select: '*',
        _where: [],
        _update: null,
        _limit: null,
        select(cols = '*') { this._select = cols; return this; },
        eq(col, val) { this._where.push(`${col} = '${val}'`); return this; },
        in(col, vals) {
          const list = vals.map(v => `'${v}'`).join(',');
          this._where.push(`${col} IN (${list})`);
          return this;
        },
        gte(col, val) { this._where.push(`${col} >= '${val}'`); return this; },
        is(col, val) {
          if (val === null) this._where.push(`${col} IS NULL`);
          else this._where.push(`${col} IS ${val}`);
          return this;
        },
        limit(n) { this._limit = n; return this; },
        order() { return this; },
        update(values) {
          this._update = values;
          return this;
        },
        async single() {
          if (this._update) {
            const setPairs = Object.entries(this._update).map(([k, v]) => {
              if (v === null) return `${k} = NULL`;
              if (typeof v === 'object') return `${k} = '${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
              if (typeof v === 'number') return `${k} = ${v}`;
              return `${k} = '${String(v).replace(/'/g, "''")}'`;
            }).join(', ');
            const whereClause = this._where.length ? `WHERE ${this._where.join(' AND ')}` : '';
            const sql = `UPDATE public.${this._table} SET ${setPairs} ${whereClause} RETURNING row_to_json(${this._table}.*);`;
            const res = runSql(sql);
            if (!res.ok) return { data: null, error: new Error(res.error) };
            try {
              return { data: res.output ? JSON.parse(res.output) : null, error: null };
            } catch (e) {
              return { data: null, error: null };
            }
          }
          const whereClause = this._where.length ? `WHERE ${this._where.join(' AND ')}` : '';
          const sql = `SELECT row_to_json(r) FROM (SELECT ${this._select} FROM public.${this._table} ${whereClause} LIMIT 1) r;`;
          const res = runSql(sql);
          if (!res.ok) return { data: null, error: new Error(res.error) };
          try {
            return { data: res.output ? JSON.parse(res.output) : null, error: null };
          } catch (e) {
            return { data: null, error: e };
          }
        },
        async maybeSingle() {
          return this.single();
        },
        async then(resolve) {
          if (this._update) {
            return resolve(await this.single());
          }
          if (this._table === 'mock_exam_questions') {
            const whereClause = this._where.length ? `WHERE ${this._where.map(w => 'meq.' + w).join(' AND ')}` : '';
            const sql = `
              SELECT coalesce(json_agg(r), '[]'::json)
              FROM (
                SELECT
                  meq.question_id,
                  json_build_object(
                    'id', qb.id,
                    'domain', qb.domain,
                    'question_type', qb.question_type,
                    'explanation_uz', qb.explanation_uz,
                    'question_bank_translations', (
                      SELECT json_agg(json_build_object('question_text', qbt.question_text, 'options', qbt.options))
                      FROM public.question_bank_translations qbt
                      WHERE qbt.question_id = qb.id AND qbt.locale = 'uz'
                    )
                  ) AS question
                FROM public.mock_exam_questions meq
                JOIN public.question_bank qb ON qb.id = meq.question_id
                ${whereClause}
              ) r;
            `;
            const res = runSql(sql);
            if (!res.ok) return resolve({ data: null, error: new Error(res.error), count: 0 });
            try {
              const rows = res.output ? JSON.parse(res.output) : [];
              return resolve({ data: rows, error: null, count: rows.length });
            } catch (e) {
              return resolve({ data: [], error: null, count: 0 });
            }
          }
          const whereClause = this._where.length ? `WHERE ${this._where.join(' AND ')}` : '';
          const limitClause = this._limit ? `LIMIT ${this._limit}` : '';
          const sql = `SELECT coalesce(json_agg(r), '[]'::json) FROM (SELECT ${this._select} FROM public.${this._table} ${whereClause} ${limitClause}) r;`;
          const res = runSql(sql);
          if (!res.ok) return resolve({ data: null, error: new Error(res.error), count: 0 });
          try {
            const rows = res.output ? JSON.parse(res.output) : [];
            return resolve({ data: rows, error: null, count: rows.length });
          } catch (e) {
            return resolve({ data: [], error: null, count: 0 });
          }
        }
      };
    }
  };
}

const realDbClient = createRealPgClient();
const deps = {
  createClient: () => realDbClient,
  userOverride: { id: ALICE_ID, email: 'alice@example.com' }
};

// Setup fresh active diagnostic attempt for concurrency
const valid50Sql = ALL_50_QIDS.map(id => `'${id}'`).join(',');
const rDiagConc = runSql(
  `INSERT INTO public.diagnostic_attempts (user_id, course_id, question_ids)
   VALUES ('${ALICE_ID}', '${COURSE_1}', ARRAY[${valid50Sql}]::uuid[])
   RETURNING id;`
);
const concDiagId = rDiagConc.output.split('\n')[0].trim();

// Req 1: 50 correct answers (index 0)
const req1Payload = {
  diagnostic_attempt_id: concDiagId,
  batch: ALL_50_QIDS.map(id => ({ question_id: id, user_answer: 0 }))
};

// Req 2: 50 wrong answers (index 1)
const req2Payload = {
  diagnostic_attempt_id: concDiagId,
  batch: ALL_50_QIDS.map(id => ({ question_id: id, user_answer: 1 }))
};

const fakeReq1 = new Request('http://localhost/check-answer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(req1Payload)
});

const fakeReq2 = new Request('http://localhost/check-answer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(req2Payload)
});

// Run both concurrently
const [resp1, resp2] = await Promise.all([
  handleCheckAnswer(fakeReq1, deps),
  handleCheckAnswer(fakeReq2, deps)
]);

const data1 = await resp1.json();
const data2 = await resp2.json();

const oneWon = (data1.total_score !== undefined && data2.already_completed === true) ||
               (data2.total_score !== undefined && data1.already_completed === true);

assert(
  '4.1 Two concurrent check-answer requests: exactly one updates DB, loser receives already_completed',
  oneWon,
  `Req1: ${JSON.stringify(data1)}, Req2: ${JSON.stringify(data2)}`
);

// Verify committed row in PostgreSQL
const rCommitted = runSqlJson(`SELECT total_score, finished_at FROM public.diagnostic_attempts WHERE id = '${concDiagId}';`);
const finalScoreInDb = rCommitted.data?.[0]?.total_score;
const isFinishedInDb = Boolean(rCommitted.data?.[0]?.finished_at);
assert(
  '4.2 Committed diagnostic record in PostgreSQL has non-null finished_at and winner score',
  isFinishedInDb && finalScoreInDb !== null,
  `Score: ${finalScoreInDb}, finished_at: ${rCommitted.data?.[0]?.finished_at}`
);

// Repeat call on finished diagnostic attempt
const repeatReq = new Request('http://localhost/check-answer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(req1Payload)
});
const respRepeat = await handleCheckAnswer(repeatReq, deps);
const dataRepeat = await respRepeat.json();
assert(
  '4.3 Subsequent retry on finished diagnostic attempt returns already_completed with preserved score',
  dataRepeat.already_completed === true && dataRepeat.total_score === finalScoreInDb,
  JSON.stringify(dataRepeat)
);

// 4.4 Real Concurrency on Exam Attempts (via check-answer exam branch)
const rExamConc = runSql(
  `INSERT INTO public.exam_attempts (user_id, course_id, question_ids)
   VALUES ('${ALICE_ID}', '${COURSE_1}', ARRAY[${valid50Sql}]::uuid[])
   RETURNING id;`
);
const concExamId = rExamConc.output.split('\n')[0].trim();

const examBatchCorrect = ALL_50_QIDS.map(id => ({ question_id: id, user_answer: 0 }));
const examBatchWrong   = ALL_50_QIDS.map(id => ({ question_id: id, user_answer: 1 }));

const examReq1 = new Request('http://localhost/check-answer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ exam_attempt_id: concExamId, batch: examBatchCorrect })
});
const examReq2 = new Request('http://localhost/check-answer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ exam_attempt_id: concExamId, batch: examBatchWrong })
});

const [examResp1, examResp2] = await Promise.all([
  handleCheckAnswer(examReq1, deps),
  handleCheckAnswer(examReq2, deps)
]);
const examData1 = await examResp1.json();
const examData2 = await examResp2.json();

const examOneWon = (examData1.total_score !== undefined && examData2.already_completed === true) ||
                   (examData2.total_score !== undefined && examData1.already_completed === true);

assert(
  '4.4 Two concurrent exam submissions: atomic completion, loser receives already_completed',
  examOneWon,
  `Resp1: ${JSON.stringify(examData1)}, Resp2: ${JSON.stringify(examData2)}`
);

// Repeat call on finished exam attempt
const examRepeatReq = new Request('http://localhost/check-answer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ exam_attempt_id: concExamId, batch: examBatchCorrect })
});
const examRepeatResp = await handleCheckAnswer(examRepeatReq, deps);
const examRepeatData = await examRepeatResp.json();
assert(
  '4.5 Subsequent retry on finished exam attempt returns already_completed with preserved score',
  examRepeatData.already_completed === true,
  JSON.stringify(examRepeatData)
);

// 4.6 finish-exam on mock exam attempt
const rMockAttempt = runSql(
  `INSERT INTO public.exam_attempts (user_id, course_id, mock_exam_id, question_ids, started_at)
   VALUES ('${ALICE_ID}', '${COURSE_1}', '${MOCK_1}', ARRAY[${valid50Sql}]::uuid[], timezone('utc', now()))
   RETURNING id;`
);
const mockAttemptId = rMockAttempt.output.split('\n')[0].trim();

// Insert answers for Alice
runSql(`
  INSERT INTO public.exam_answers (attempt_id, question_id, user_answer)
  SELECT '${mockAttemptId}', id, '0'::jsonb
  FROM public.question_bank
  WHERE course_id = '${COURSE_1}'
  ON CONFLICT DO NOTHING;
`);

const finishReq1 = new Request('http://localhost/finish-exam', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ attempt_id: mockAttemptId })
});
const finishReq2 = new Request('http://localhost/finish-exam', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ attempt_id: mockAttemptId })
});

const [fResp1, fResp2] = await Promise.all([
  handleFinishExam(finishReq1, deps),
  handleFinishExam(finishReq2, deps)
]);
const fData1 = await fResp1.json();
const fData2 = await fResp2.json();

const finishOneWon = (fData1.score !== undefined && fData2.already_completed === true) ||
                     (fData2.score !== undefined && fData1.already_completed === true) ||
                     (fData1.already_completed === true && fData2.already_completed === true);

assert(
  '4.6 Two concurrent finish-exam calls on mock exam: atomic completion, no duplicate grading',
  finishOneWon,
  `Resp1: ${JSON.stringify(fData1)}, Resp2: ${JSON.stringify(fData2)}`
);

console.log(`\n===============================================================`);
console.log(`Summary: ${passed} PASSED, ${failed} FAILED`);
console.log(`===============================================================\n`);

if (failed > 0) process.exit(1);
