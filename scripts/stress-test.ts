/**
 * Full system stress test — covers every major feature concurrently.
 *
 * Usage:
 *   npx tsx scripts/stress-test.ts
 *
 * Env overrides:
 *   STRESS_TEST_URL              Target server (default: http://localhost:3000)
 *   STRESS_TEST_ADMIN_EMAIL      Admin account email
 *   STRESS_TEST_ADMIN_PASSWORD   Admin account password
 *   STRESS_TEST_CONCURRENCY      Parallel registrations per round (default: 10)
 *   STRESS_TEST_ROUNDS           Rounds (default: 3)
 */

import dotenv from "dotenv";
dotenv.config();

const BASE = (process.env.STRESS_TEST_URL || "http://localhost:3000").replace(/\/$/, "");
const ADMIN_EMAIL = process.env.STRESS_TEST_ADMIN_EMAIL || "admin@cugolfclub.com";
const ADMIN_PASSWORD = process.env.STRESS_TEST_ADMIN_PASSWORD || "cugolfx2026";
const CONCURRENCY = Number(process.env.STRESS_TEST_CONCURRENCY) || 10;
const ROUNDS = Number(process.env.STRESS_TEST_ROUNDS) || 3;
const RUN_ID = String(Date.now()).slice(-8);

// ── helpers ──────────────────────────────────────────────────────────────────

type R = { ok: boolean; status: number; body: any; ms: number };

async function req(method: string, path: string, body?: any, token?: string): Promise<R> {
  const start = Date.now();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
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
    email: `st-${RUN_ID}-r${round}-${i}@test.local`,
    password: `Pass${RUN_ID}${round}${i}!`,
    prefix: i % 2 === 0 ? "นาย" : "นางสาว",
    name: `Test User R${round}-${i}`,
    studentId: `${RUN_ID}${round}${String(i).padStart(2, "0")}`,
    year: "Year 1",
    faculty: "Engineering",
    instagram: `@test_${RUN_ID}_${i}`,
    lineId: `line_${RUN_ID}_${i}`
  };
}

async function parallel<T>(fns: (() => Promise<T>)[]): Promise<T[]> {
  return Promise.all(fns.map(f => f()));
}

// ── result tracking ───────────────────────────────────────────────────────────

interface Suite {
  name: string;
  passed: number;
  failed: number;
  failures: string[];
}

const suites: Suite[] = [];
let currentSuite: Suite = { name: "", passed: 0, failed: 0, failures: [] };

function suite(name: string) {
  if (currentSuite.name) suites.push(currentSuite);
  currentSuite = { name, passed: 0, failed: 0, failures: [] };
  console.log(`\n  ─── ${name} ───`);
}

function pass(label: string) {
  currentSuite.passed++;
  console.log(`    ✅ ${label}`);
}

function fail(label: string, reason: string) {
  currentSuite.failed++;
  currentSuite.failures.push(`${label}: ${reason}`);
  console.log(`    ❌ ${label} — ${reason}`);
}

function check(label: string, condition: boolean, reason: string) {
  condition ? pass(label) : fail(label, reason);
}

// ── test runner ───────────────────────────────────────────────────────────────

async function run() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║          CU GOLF CLUB — FULL SYSTEM STRESS TEST            ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log(`\n  Target     : ${BASE}`);
  console.log(`  Concurrency: ${CONCURRENCY} parallel per round  ×  ${ROUNDS} rounds`);
  console.log(`  Run ID     : ${RUN_ID}\n`);

  const registeredUsers: { email: string; password: string; id?: string }[] = [];
  let adminToken = "";

  // ── 1. Admin Login ─────────────────────────────────────────────────────────
  suite("1. Admin Login");
  {
    const r = await req("POST", "/api/members/login", { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    if (r.ok && r.body.success && r.body.token) {
      adminToken = r.body.token;
      pass(`Admin login OK (${r.ms}ms)`);
      check("Admin flag set", !!r.body.user?.isAdmin, "isAdmin not true");
    } else {
      fail("Admin login", r.body.message || `HTTP ${r.status}`);
      console.log("\n  ⚠️  Admin login failed — some tests will be skipped.\n");
    }
  }

  // ── 2. Concurrent Registration + Concurrent Login (RLS test) ──────────────
  for (let round = 1; round <= ROUNDS; round++) {
    suite(`2. Concurrent Registration — Round ${round}/${ROUNDS} (${CONCURRENCY} reg + ${CONCURRENCY} login)`);
    const users = Array.from({ length: CONCURRENCY }, (_, i) => testUser(round, i));

    // Cap concurrent logins at 3 to avoid exhausting Supabase auth rate limit
    const loginCount = Math.min(3, CONCURRENCY);
    const [regResults, loginResults] = await Promise.all([
      parallel(users.map(u => () => req("POST", "/api/members/register", u))),
      parallel(Array.from({ length: loginCount }, () => () =>
        req("POST", "/api/members/login", { email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      ))
    ]);

    let regOk = 0;
    for (let i = 0; i < regResults.length; i++) {
      const r = regResults[i];
      if (r.ok && r.body.success) {
        regOk++;
        registeredUsers.push({ email: users[i].email, password: users[i].password });
      } else {
        fail(`Register user ${i}`, r.body.message || `HTTP ${r.status}`);
      }
    }
    if (regOk > 0) pass(`${regOk}/${CONCURRENCY} registrations succeeded (${Math.round(regResults.reduce((s, r) => s + r.ms, 0) / regResults.length)}ms avg)`);

    const loginOk = loginResults.filter(r => r.ok && r.body.success).length;
    check(`Admin logins concurrent (${loginOk}/${loginCount})`, loginOk > 0, "All concurrent logins failed");
  }

  // ── 3. Duplicate Rejection ─────────────────────────────────────────────────
  suite("3. Duplicate Registration Rejection");
  if (registeredUsers.length > 0) {
    const dup = { ...testUser(1, 0), email: "new-email-unique@test.local" }; // same studentId
    const r = await req("POST", "/api/members/register", dup);
    check("Duplicate student ID rejected", !r.body.success && r.status === 400, "Should have been rejected");
    const dup2 = { ...testUser(99, 99), email: registeredUsers[0].email }; // same email
    const r2 = await req("POST", "/api/members/register", dup2);
    check("Duplicate email rejected", !r2.body.success && r2.status === 400, "Should have been rejected");
  } else {
    fail("Skipped", "No registered users from previous step");
  }

  // ── 4. Invalid Login Rejection ─────────────────────────────────────────────
  suite("4. Invalid Credentials Rejection");
  {
    const r = await req("POST", "/api/members/login", { email: "nobody@test.local", password: "wrong" });
    check("Wrong email rejected", r.status === 401, `Got ${r.status}`);
    const r2 = await req("POST", "/api/members/login", { email: ADMIN_EMAIL, password: "wrongpassword" });
    check("Wrong password rejected", r2.status === 401, `Got ${r2.status}`);
  }

  // ── 5. Member Login + Profile ──────────────────────────────────────────────
  suite("5. Member Login + Profile Fetch");
  const memberTokens: string[] = [];
  let tokenOwner: { email: string; password: string } | null = null; // which user owns memberTokens[0]
  if (registeredUsers.length > 0) {
    // Pause so Supabase auth rate-limit resets (free tier: ~10 req/min on /auth/v1/token)
    await new Promise(r => setTimeout(r, 8000));
    const loginCandidates = registeredUsers.slice(0, Math.min(5, registeredUsers.length));
    const loginResults = await parallel(loginCandidates.map(u => () =>
      req("POST", "/api/members/login", { email: u.email, password: u.password })
    ));
    for (let i = 0; i < loginResults.length; i++) {
      const r = loginResults[i];
      if (r.ok && r.body.success && r.body.token) {
        if (!tokenOwner) tokenOwner = loginCandidates[i]; // track which user's creds we have
        memberTokens.push(r.body.token);
      } else {
        console.log(`    ⚠️  Login [${i}] returned ${r.status}: ${r.body.message || JSON.stringify(r.body)}`);
      }
    }
    check(`Member logins (${memberTokens.length}/${loginCandidates.length})`,
      memberTokens.length > 0, "No member tokens obtained");

    if (memberTokens.length > 0) {
      const profile = await req("GET", "/api/members/me", undefined, memberTokens[0]);
      check("Profile fetch", profile.ok && profile.body.success, profile.body.message || `HTTP ${profile.status}`);
    }
  } else {
    fail("Skipped", "No registered users");
  }

  // ── 6. Change Password (no email required) ─────────────────────────────────
  suite("6. Change Password (in-app, no email)");
  if (memberTokens.length > 0 && tokenOwner) {
    const user = tokenOwner; // use the user whose login actually succeeded
    const newPw = `NewPass${RUN_ID}!`;
    const token = memberTokens[0];

    const wrong = await req("POST", "/api/members/change-password", { oldPassword: "wrongpassword", newPassword: newPw }, token);
    check("Wrong current password rejected", wrong.status === 401, `Got ${wrong.status}`);

    const short = await req("POST", "/api/members/change-password", { oldPassword: user.password, newPassword: "abc" }, token);
    check("Too-short password rejected", short.status === 400, `Got ${short.status}`);

    const change = await req("POST", "/api/members/change-password", { oldPassword: user.password, newPassword: newPw }, token);
    check("Password changed successfully", change.ok && change.body.success, change.body.message || `HTTP ${change.status}`);

    if (change.ok && change.body.success) {
      const loginNew = await req("POST", "/api/members/login", { email: user.email, password: newPw });
      check("Login with new password", loginNew.ok && loginNew.body.success, loginNew.body.message || `HTTP ${loginNew.status}`);
      user.password = newPw; // update for cleanup
    }
  } else {
    fail("Skipped", "No member tokens");
  }

  // ── 7. Admin Member List ───────────────────────────────────────────────────
  suite("7. Admin Member List");
  let memberIds: string[] = [];
  if (adminToken) {
    const r = await req("GET", "/api/admin/members", undefined, adminToken);
    check("Fetch members list", r.ok && r.body.success, r.body.message || `HTTP ${r.status}`);
    if (r.ok && r.body.members) {
      const testMembers = (r.body.members as any[]).filter(m => m.email?.includes(`st-${RUN_ID}`));
      memberIds = testMembers.map(m => m.id);
      pass(`Found ${testMembers.length} test members in directory`);
    }
  } else {
    fail("Skipped", "No admin token");
  }

  // ── 8. Admin Member Edit ───────────────────────────────────────────────────
  suite("8. Admin Member Edit");
  if (adminToken && memberIds.length > 0) {
    const r = await req("PUT", `/api/admin/members/${memberIds[0]}`,
      { name: `Edited User ${RUN_ID}`, faculty: "Edited Faculty" }, adminToken);
    check("Edit member profile", r.ok && r.body.success, r.body.message || `HTTP ${r.status}`);
  } else {
    fail("Skipped", adminToken ? "No test member IDs" : "No admin token");
  }

  // ── 9. Google Sheets Sync ─────────────────────────────────────────────────
  suite("9. Google Sheets Sync");
  if (adminToken) {
    const r = await req("POST", "/api/admin/sync-sheets", undefined, adminToken);
    if (r.ok && r.body.success) {
      pass(`Sync OK — ${r.body.synced ?? "?"}/${r.body.total ?? "?"} members sent (${r.ms}ms)`);
    } else if (r.status === 500 && r.body.message?.includes("GOOGLE_SHEETS_WEBHOOK_URL")) {
      pass("Sheets URL not configured (expected in test env) — endpoint responds correctly");
    } else {
      fail("Sync sheets", r.body.message || `HTTP ${r.status}`);
    }
  } else {
    fail("Skipped", "No admin token");
  }

  // ── 10. Missing Fields Validation ─────────────────────────────────────────
  suite("10. Input Validation");
  {
    const r1 = await req("POST", "/api/members/register", { email: "x@x.com" }); // missing fields
    check("Registration: missing fields rejected", r1.status === 400, `Got ${r1.status}`);
    const r2 = await req("POST", "/api/members/login", {}); // missing fields
    check("Login: missing fields rejected", r2.status === 400, `Got ${r2.status}`);
    const r3 = await req("GET", "/api/admin/members"); // no token
    check("Admin endpoint: no token rejected", r3.status === 401 || r3.status === 403, `Got ${r3.status}`);
  }

  // ── 11. Cleanup ────────────────────────────────────────────────────────────
  suite("11. Cleanup Test Accounts");
  if (adminToken && memberIds.length > 0) {
    const results = await parallel(memberIds.map(id => () =>
      req("DELETE", `/api/admin/members/${id}`, undefined, adminToken)
    ));
    const deleted = results.filter(r => r.ok && r.body.success).length;
    check(`Deleted ${deleted}/${memberIds.length} test accounts`, deleted === memberIds.length,
      `Only ${deleted} deleted`);
  } else {
    fail("Skipped", adminToken ? "No member IDs to clean up" : "No admin token");
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  suites.push(currentSuite);
  const totalPassed = suites.reduce((s, t) => s + t.passed, 0);
  const totalFailed = suites.reduce((s, t) => s + t.failed, 0);
  const allPassed = totalFailed === 0;

  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log(`║  RESULTS: ${String(totalPassed).padStart(3)} passed  ${String(totalFailed).padStart(3)} failed                              ║`);
  console.log("╚════════════════════════════════════════════════════════════╝");

  for (const s of suites) {
    const icon = s.failed === 0 ? "✅" : "❌";
    console.log(`  ${icon}  ${s.name} — ${s.passed} passed, ${s.failed} failed`);
    for (const f of s.failures) console.log(`       · ${f}`);
  }

  console.log(`\n  ${allPassed ? "✅  ALL TESTS PASSED" : "❌  SOME TESTS FAILED"}\n`);
  process.exit(allPassed ? 0 : 1);
}

run().catch(err => {
  console.error("\nStress test crashed:", err);
  process.exit(1);
});
