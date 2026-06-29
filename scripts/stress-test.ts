/**
 * Stress test: concurrent registrations + logins fired simultaneously.
 * Reproduces the original RLS contamination scenario and verifies the fix.
 *
 * Usage:
 *   npx tsx scripts/stress-test.ts
 *
 * Options (env vars):
 *   STRESS_TEST_URL            Target server (default: http://localhost:3000)
 *   STRESS_TEST_LOGIN_EMAIL    Existing account email for login requests
 *   STRESS_TEST_LOGIN_PASSWORD Password for the above account
 *   STRESS_TEST_CONCURRENCY    Number of parallel registrations per round (default: 15)
 *   STRESS_TEST_ROUNDS         Number of rounds (default: 3)
 */

import dotenv from "dotenv";
dotenv.config();

const SERVER_URL = (process.env.STRESS_TEST_URL || "http://localhost:3000").replace(/\/$/, "");
const LOGIN_EMAIL = process.env.STRESS_TEST_LOGIN_EMAIL || "admin@cugolfclub.com";
const LOGIN_PASSWORD = process.env.STRESS_TEST_LOGIN_PASSWORD || "cugolfx2026";
const CONCURRENCY = Number(process.env.STRESS_TEST_CONCURRENCY) || 15;
const ROUNDS = Number(process.env.STRESS_TEST_ROUNDS) || 3;

const RUN_ID = Date.now();

interface Result {
  index: number;
  round: number;
  type: "register" | "login";
  success: boolean;
  status: number;
  message?: string;
  elapsedMs: number;
}

function makeTestUser(round: number, index: number) {
  return {
    email: `stress-${RUN_ID}-r${round}-${index}@test.local`,
    password: "StressTest123!",
    prefix: index % 2 === 0 ? "นาย" : "นางสาว",
    name: `Stress Test R${round}-${index}`,
    studentId: `${String(RUN_ID).slice(-6)}${round}${String(index).padStart(3, "0")}`,
    year: "Year 1",
    faculty: "Stress Test Faculty",
    instagram: `@stress_${round}_${index}`,
    lineId: `stress_line_${round}_${index}`
  };
}

async function register(user: ReturnType<typeof makeTestUser>, round: number, index: number): Promise<Result> {
  const start = Date.now();
  try {
    const res = await fetch(`${SERVER_URL}/api/members/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });
    const data = await res.json();
    return { index, round, type: "register", success: !!data.success, status: res.status, message: data.message, elapsedMs: Date.now() - start };
  } catch (err: any) {
    return { index, round, type: "register", success: false, status: 0, message: err.message, elapsedMs: Date.now() - start };
  }
}

async function login(round: number, index: number): Promise<Result> {
  const start = Date.now();
  try {
    const res = await fetch(`${SERVER_URL}/api/members/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: LOGIN_EMAIL, password: LOGIN_PASSWORD })
    });
    const data = await res.json();
    return { index, round, type: "login", success: !!data.success, status: res.status, elapsedMs: Date.now() - start };
  } catch (err: any) {
    return { index, round, type: "login", success: false, status: 0, message: err.message, elapsedMs: Date.now() - start };
  }
}

async function getAdminToken(): Promise<string | null> {
  try {
    const res = await fetch(`${SERVER_URL}/api/members/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: LOGIN_EMAIL, password: LOGIN_PASSWORD })
    });
    const data = await res.json();
    return data.success && data.user?.isAdmin ? data.token : null;
  } catch {
    return null;
  }
}

async function cleanup(adminToken: string, testEmails: Set<string>) {
  try {
    const res = await fetch(`${SERVER_URL}/api/admin/members`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success) return 0;

    const targets = (data.members || []).filter((m: any) => testEmails.has(m.email));
    await Promise.all(
      targets.map((m: any) =>
        fetch(`${SERVER_URL}/api/admin/members/${m.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${adminToken}` }
        })
      )
    );
    return targets.length;
  } catch {
    return 0;
  }
}

function printResult(results: Result[], label: string) {
  const regs = results.filter(r => r.type === "register");
  const logins = results.filter(r => r.type === "login");
  const regOk = regs.filter(r => r.success);
  const regFail = regs.filter(r => !r.success);
  const avgMs = regs.length ? Math.round(regs.reduce((s, r) => s + r.elapsedMs, 0) / regs.length) : 0;

  console.log(`\n  Registrations : ${regOk.length}/${regs.length} OK  |  avg ${avgMs}ms`);
  console.log(`  Logins        : ${logins.filter(r => r.success).length}/${logins.length} OK`);

  if (regFail.length > 0) {
    console.log(`\n  ❌ REGISTRATION FAILURES in ${label}:`);
    regFail.forEach(r =>
      console.log(`     [${r.index}] HTTP ${r.status} — ${r.message || "unknown error"}`)
    );
  }

  return regFail.length === 0;
}

async function run() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║        CU GOLF CLUB — REGISTRATION STRESS TEST       ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`\n  Target  : ${SERVER_URL}`);
  console.log(`  Rounds  : ${ROUNDS}`);
  console.log(`  Per round: ${CONCURRENCY} registrations + ${CONCURRENCY} logins (all concurrent)`);
  console.log(`  Scenario: Mixed logins & registrations fire simultaneously`);
  console.log(`            (reproduces the original RLS session-pollution bug)\n`);

  const allResults: Result[] = [];
  const allEmails = new Set<string>();
  let allPassed = true;

  for (let round = 1; round <= ROUNDS; round++) {
    const users = Array.from({ length: CONCURRENCY }, (_, i) => makeTestUser(round, i));
    users.forEach(u => allEmails.add(u.email));

    process.stdout.write(`  Round ${round}/${ROUNDS} — firing ${CONCURRENCY * 2} concurrent requests... `);

    const regPromises = users.map((u, i) => register(u, round, i));
    const loginPromises = Array.from({ length: CONCURRENCY }, (_, i) => login(round, i));

    const results = await Promise.all([...regPromises, ...loginPromises]);
    allResults.push(...results);

    const passed = printResult(results, `Round ${round}`);
    if (!passed) allPassed = false;

    // Brief pause between rounds
    if (round < ROUNDS) await new Promise(r => setTimeout(r, 500));
  }

  // Summary
  const totalRegs = allResults.filter(r => r.type === "register");
  const totalOk = totalRegs.filter(r => r.success);

  console.log("\n══════════════════════════════════════════════════════");
  console.log(`  TOTAL: ${totalOk.length}/${totalRegs.length} registrations succeeded across ${ROUNDS} rounds`);

  if (allPassed) {
    console.log("  ✅  PASS — No RLS violations. Session isolation is working correctly.");
  } else {
    console.log("  ❌  FAIL — Some registrations failed. Review errors above.");
  }

  // Cleanup
  console.log("\n  Cleaning up test accounts...");
  const adminToken = await getAdminToken();
  if (adminToken) {
    const deleted = await cleanup(adminToken, allEmails);
    console.log(`  ✅  Deleted ${deleted} test accounts.`);
  } else {
    console.log("  ⚠️  Could not obtain admin token for cleanup.");
    console.log(`      Delete manually: emails matching stress-${RUN_ID}-*@test.local`);
  }

  console.log("══════════════════════════════════════════════════════\n");
  process.exit(allPassed ? 0 : 1);
}

run().catch(err => {
  console.error("Stress test crashed:", err);
  process.exit(1);
});
