/**
 * CU Golf Club — Full System Stress Test
 *
 * Usage:
 *   npm run stress:test
 *
 * Env overrides:
 *   STRESS_TEST_URL          Target server (default: http://localhost:3000)
 *   STRESS_TEST_ADMIN_EMAIL  Admin email  (default: tigerpukk@gmail.com)
 *   STRESS_TEST_ADMIN_KEY    Admin master key / student ID field (default: cugolfx2026)
 *   STRESS_TEST_CONCURRENCY  Parallel registrations per round (default: 10)
 *   STRESS_TEST_ROUNDS       Rounds (default: 3)
 */

import dotenv from "dotenv";
dotenv.config();

const BASE        = (process.env.STRESS_TEST_URL || "http://localhost:3000").replace(/\/$/, "");
const ADMIN_EMAIL = process.env.STRESS_TEST_ADMIN_EMAIL || "tigerpukk@gmail.com";
const ADMIN_KEY   = process.env.STRESS_TEST_ADMIN_KEY   || "cugolfx2026";
const CONCURRENCY = Number(process.env.STRESS_TEST_CONCURRENCY) || 10;
const ROUNDS      = Number(process.env.STRESS_TEST_ROUNDS)      || 3;
const RUN_ID      = String(Date.now()).slice(-6);

// ── helpers ───────────────────────────────────────────────────────────────────

type R = { ok: boolean; status: number; body: any; ms: number };

async function req(method: string, path: string, body?: any, token?: string): Promise<R> {
  const start = Date.now();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let parsed: any = {};
    try { parsed = JSON.parse(text); } catch {}
    return { ok: res.ok, status: res.status, body: parsed, ms: Date.now() - start };
  } catch (e: any) {
    return { ok: false, status: 0, body: { message: e.message }, ms: Date.now() - start };
  }
}

function testUser(round: number, i: number) {
  return {
    email:     `st-${RUN_ID}-r${round}-${i}@test.local`,
    prefix:    i % 2 === 0 ? "นาย" : "นางสาว",
    name:      `Stress User R${round}-${i}`,
    studentId: `${RUN_ID}${round}${String(i).padStart(2, "0")}`,
    year:      "Year 1",
    faculty:   "Engineering",
    instagram: `@st_${RUN_ID}_${i}`,
    lineId:    `line_${RUN_ID}_${i}`,
  };
}

async function parallel<T>(fns: (() => Promise<T>)[]): Promise<T[]> {
  return Promise.all(fns.map(f => f()));
}

// ── result tracking ───────────────────────────────────────────────────────────

interface Suite { name: string; passed: number; failed: number; failures: string[] }
const suites: Suite[] = [];
let cur: Suite = { name: "", passed: 0, failed: 0, failures: [] };

function suite(name: string) {
  if (cur.name) suites.push(cur);
  cur = { name, passed: 0, failed: 0, failures: [] };
  console.log(`\n  ─── ${name} ───`);
}
function pass(label: string) {
  cur.passed++;
  console.log(`    ✅ ${label}`);
}
function fail(label: string, reason: string) {
  cur.failed++;
  cur.failures.push(`${label}: ${reason}`);
  console.log(`    ❌ ${label} — ${reason}`);
}
function check(label: string, ok: boolean, reason: string) {
  ok ? pass(label) : fail(label, reason);
}

// ── latency stats ─────────────────────────────────────────────────────────────

function stats(ms: number[]) {
  if (!ms.length) return "n/a";
  const sorted = [...ms].sort((a, b) => a - b);
  const avg = Math.round(ms.reduce((s, v) => s + v, 0) / ms.length);
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const max = sorted[sorted.length - 1];
  return `avg ${avg}ms  p95 ${p95}ms  max ${max}ms`;
}

// ── main ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║        CU GOLF CLUB — FULL SYSTEM STRESS TEST             ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log(`\n  Target      : ${BASE}`);
  console.log(`  Admin email : ${ADMIN_EMAIL}`);
  console.log(`  Concurrency : ${CONCURRENCY} parallel × ${ROUNDS} rounds`);
  console.log(`  Run ID      : ${RUN_ID}\n`);

  const registeredUsers: { email: string; studentId: string }[] = [];
  let adminToken = "";

  // ── 1. Health check ───────────────────────────────────────────────────────
  suite("1. Health Check");
  {
    const r = await req("GET", "/api/health");
    check(`Server reachable (${r.ms}ms)`, r.status !== 0, "Connection refused — is the server running?");
  }

  // ── 2. Read-only DB load ──────────────────────────────────────────────────
  suite("2. Read-only DB Load (30 concurrent /api/db)");
  {
    const results = await parallel(Array.from({ length: 30 }, () => () => req("GET", "/api/db")));
    const ok = results.filter(r => r.ok).length;
    const ms = results.map(r => r.ms);
    check(`${ok}/30 succeeded`, ok >= 28, `Only ${ok} succeeded`);
    pass(`Latency: ${stats(ms)}`);
  }

  // ── 3. Admin login ────────────────────────────────────────────────────────
  suite("3. Admin Login");
  {
    const r = await req("POST", "/api/members/login", { email: ADMIN_EMAIL, studentId: ADMIN_KEY });
    if (r.ok && r.body.success && r.body.token) {
      adminToken = r.body.token;
      pass(`Admin login OK (${r.ms}ms)`);
      check("isAdmin flag set", !!r.body.user?.isAdmin, "isAdmin not true in response");
    } else {
      fail("Admin login", r.body.message || `HTTP ${r.status}`);
      console.log("  ⚠️  Admin login failed — admin-gated tests will be skipped.\n");
    }
  }

  // ── 4. Concurrent registration ────────────────────────────────────────────
  for (let round = 1; round <= ROUNDS; round++) {
    suite(`4. Concurrent Registration — Round ${round}/${ROUNDS} (${CONCURRENCY} parallel)`);
    const users = Array.from({ length: CONCURRENCY }, (_, i) => testUser(round, i));
    const results = await parallel(users.map(u => () => req("POST", "/api/members/register", u)));
    const ms = results.map(r => r.ms);
    let ok = 0;
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.ok && r.body.success) {
        ok++;
        registeredUsers.push({ email: users[i].email, studentId: users[i].studentId });
      } else {
        fail(`Register [r${round}-${i}]`, r.body.message || `HTTP ${r.status}`);
      }
    }
    if (ok > 0) pass(`${ok}/${CONCURRENCY} registered — ${stats(ms)}`);
  }

  // ── 5. Duplicate rejection ────────────────────────────────────────────────
  suite("5. Duplicate Rejection");
  if (registeredUsers.length > 0) {
    const u0 = registeredUsers[0];
    const dupId = await req("POST", "/api/members/register", {
      ...testUser(99, 0), email: `new-unique-${RUN_ID}@test.local`, studentId: u0.studentId
    });
    check("Duplicate student ID rejected (400)", !dupId.body.success && dupId.status === 400,
      `Got ${dupId.status}: ${dupId.body.message}`);

    const dupEmail = await req("POST", "/api/members/register", {
      ...testUser(99, 1), email: u0.email, studentId: `UNIQUE${RUN_ID}`
    });
    check("Duplicate email rejected (400)", !dupEmail.body.success && dupEmail.status === 400,
      `Got ${dupEmail.status}: ${dupEmail.body.message}`);
  } else {
    fail("Skipped", "No users registered in step 4");
  }

  // ── 6. Input validation ───────────────────────────────────────────────────
  suite("6. Input Validation");
  {
    const r1 = await req("POST", "/api/members/register", { email: "x@x.com" });
    check("Missing studentId/name → 400", r1.status === 400, `Got ${r1.status}`);
    const r2 = await req("POST", "/api/members/login", { email: "x@x.com" });
    check("Login missing studentId → 400", r2.status === 400, `Got ${r2.status}`);
    const r3 = await req("POST", "/api/members/login", {});
    check("Login empty body → 400", r3.status === 400, `Got ${r3.status}`);
  }

  // ── 7. Invalid credentials ────────────────────────────────────────────────
  suite("7. Invalid Credentials Rejection");
  {
    const r1 = await req("POST", "/api/members/login", { email: "nobody@fake.com", studentId: "0000000000" });
    check("Unknown email → 401", r1.status === 401, `Got ${r1.status}`);
    if (registeredUsers.length > 0) {
      const r2 = await req("POST", "/api/members/login", { email: registeredUsers[0].email, studentId: "0000000000" });
      check("Wrong student ID → 401", r2.status === 401, `Got ${r2.status}`);
    }
  }

  // ── 8. Member login + profile ─────────────────────────────────────────────
  suite("8. Member Login + Profile Fetch");
  const memberTokens: string[] = [];
  if (registeredUsers.length > 0) {
    const candidates = registeredUsers.slice(0, Math.min(5, registeredUsers.length));
    const results = await parallel(candidates.map(u => () =>
      req("POST", "/api/members/login", { email: u.email, studentId: u.studentId })
    ));
    const ms = results.map(r => r.ms);
    for (const r of results) {
      if (r.ok && r.body.success && r.body.token) memberTokens.push(r.body.token);
    }
    check(`Member logins (${memberTokens.length}/${candidates.length})`,
      memberTokens.length > 0, "No member tokens obtained");
    pass(`Latency: ${stats(ms)}`);

    if (memberTokens.length > 0) {
      const profile = await req("GET", "/api/members/me", undefined, memberTokens[0]);
      check("Profile fetch /api/members/me", profile.ok && profile.body.success,
        profile.body.message || `HTTP ${profile.status}`);
    }
  } else {
    fail("Skipped", "No registered users from step 4");
  }

  // ── 9. Auth guard checks ──────────────────────────────────────────────────
  suite("9. Auth Guard — Unauthenticated Access");
  {
    const r1 = await req("GET", "/api/admin/members");
    check("GET /api/admin/members without token → 401/403",
      r1.status === 401 || r1.status === 403, `Got ${r1.status}`);
    const r2 = await req("GET", "/api/members/me");
    check("GET /api/members/me without token → 401",
      r2.status === 401, `Got ${r2.status}`);
    const r3 = await req("GET", "/api/members/me", undefined, "Bearer invalidtoken");
    check("GET /api/members/me with bad token → 401",
      r3.status === 401, `Got ${r3.status}`);
  }

  // ── 10. Admin member list + edit ──────────────────────────────────────────
  suite("10. Admin Member List + Edit");
  let memberIds: string[] = [];
  if (adminToken) {
    const list = await req("GET", "/api/admin/members", undefined, adminToken);
    check("Fetch member list", list.ok && list.body.success, list.body.message || `HTTP ${list.status}`);
    if (list.ok && list.body.members) {
      const testMembers = (list.body.members as any[]).filter((m: any) => m.email?.includes(`st-${RUN_ID}`));
      memberIds = testMembers.map((m: any) => m.id);
      pass(`Found ${testMembers.length} test members in registry`);
    }
    if (memberIds.length > 0) {
      const edit = await req("PUT", `/api/admin/members/${memberIds[0]}`,
        { name: `Edited ${RUN_ID}`, faculty: "Stress Test Faculty" }, adminToken);
      check("Edit member profile", edit.ok && edit.body.success, edit.body.message || `HTTP ${edit.status}`);
    }
  } else {
    fail("Skipped", "No admin token");
  }

  // ── 11. Concurrent member login load ──────────────────────────────────────
  suite("11. Concurrent Login Load (20 parallel)");
  if (registeredUsers.length >= 5) {
    const pool = Array.from({ length: 20 }, (_, i) => registeredUsers[i % registeredUsers.length]);
    const results = await parallel(pool.map(u => () =>
      req("POST", "/api/members/login", { email: u.email, studentId: u.studentId })
    ));
    const ok = results.filter(r => r.ok && r.body.success).length;
    const ms = results.map(r => r.ms);
    check(`${ok}/20 logins succeeded`, ok >= 18, `Only ${ok} succeeded`);
    pass(`Latency: ${stats(ms)}`);
  } else {
    fail("Skipped", "Need ≥5 registered users");
  }

  // ── 12. Google Sheets sync ────────────────────────────────────────────────
  suite("12. Google Sheets Sync");
  if (adminToken) {
    const r = await req("POST", "/api/admin/sync-sheets", undefined, adminToken);
    if (r.ok && r.body.success) {
      pass(`Sync OK — ${r.body.synced ?? "?"}/${r.body.total ?? "?"} members (${r.ms}ms)`);
    } else if (r.body.message?.includes("GOOGLE_SHEETS_WEBHOOK_URL") || r.body.message?.includes("not configured")) {
      pass("Sheets not configured in env — endpoint responded correctly");
    } else {
      fail("Sync", r.body.message || `HTTP ${r.status}`);
    }
  } else {
    fail("Skipped", "No admin token");
  }

  // ── 13. Cleanup ───────────────────────────────────────────────────────────
  suite("13. Cleanup Test Accounts");
  if (adminToken && memberIds.length > 0) {
    const results = await parallel(memberIds.map(id => () =>
      req("DELETE", `/api/admin/members/${id}`, undefined, adminToken)
    ));
    const deleted = results.filter(r => r.ok && r.body.success).length;
    check(`Deleted ${deleted}/${memberIds.length} test accounts`,
      deleted === memberIds.length, `Only ${deleted}/${memberIds.length} deleted`);
  } else {
    fail("Skipped", adminToken ? "No test member IDs found" : "No admin token");
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  suites.push(cur);
  const totalPassed = suites.reduce((s, t) => s + t.passed, 0);
  const totalFailed = suites.reduce((s, t) => s + t.failed, 0);
  const allPassed = totalFailed === 0;

  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log(`║  RESULTS: ${String(totalPassed).padStart(3)} passed   ${String(totalFailed).padStart(3)} failed                            ║`);
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  for (const s of suites) {
    const icon = s.failed === 0 ? "✅" : "❌";
    console.log(`  ${icon}  ${s.name}`);
    for (const f of s.failures) console.log(`       · ${f}`);
  }

  console.log(`\n  ${allPassed ? "✅  ALL TESTS PASSED" : "❌  SOME TESTS FAILED"}\n`);
  process.exit(allPassed ? 0 : 1);
}

run().catch(err => {
  console.error("\n💥 Stress test crashed:", err);
  process.exit(1);
});
