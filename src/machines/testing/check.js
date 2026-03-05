// @ts-check

/**
 * SigUI core machines module for check.
 * @module
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { $ } from "bun";
const TLA_DIR = join(dirname(new URL(import.meta.url).pathname), "tla");
const MAX_LENGTH = 15;
const moduleFilter = process.argv.find((a) => a.startsWith("--module="))?.split("=")[1];
function parseInvariants(tlaPath) {
  const src = readFileSync(tlaPath, "utf-8");
  const holdInvs = [];
  const failInvs = [];
  const customInvs = [];
  for (const line of src.split(`
`)) {
    const m = line.match(/^(\w+)\s*==/);
    if (!m)
      continue;
    const name = m[1];
    if (name === "TypeOK" || name === "NoDeadlock") {
      holdInvs.push(name);
    } else if (name.startsWith("NotIn_") || name.startsWith("NoEdge_") || name.startsWith("CanDeadlock_")) {
      failInvs.push(name);
    } else if (name !== "Init" && name !== "Next" && !name.startsWith("States") && !name.startsWith("Events") && !name.startsWith("Edges") && !name.startsWith("Terminal") && name !== "vars" && !name.match(/^[A-Z][a-z]+_[A-Z]/)) {
      customInvs.push(name);
    }
  }
  return { holdInvs, failInvs, customInvs };
}
async function runCheck(check) {
  const tlaPath = join(TLA_DIR, `${check.module}.tla`);
  const start = performance.now();
  const proc = Bun.spawn([
    "apalache-mc",
    "check",
    `--inv=${check.invariant}`,
    `--length=${MAX_LENGTH}`,
    `${check.module}.tla`
  ], { stdout: "pipe", stderr: "pipe", cwd: TLA_DIR });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text()
  ]);
  const exitCode = await proc.exited;
  const durationMs = Math.round(performance.now() - start);
  const outcomeLine = stdout.match(/The outcome is: (\w+)/)?.[1] ?? "";
  const isDeadlock = stdout.includes("The outcome is: Deadlock");
  let passed;
  let detail;
  if (check.kind === "invariant_must_hold") {
    if (exitCode === 0 && outcomeLine === "NoError") {
      passed = true;
      detail = "OK";
    } else if (isDeadlock) {
      passed = false;
      detail = "DEADLOCK (unexpected)";
    } else {
      passed = false;
      detail = `VIOLATED (expected to hold)`;
    }
  } else {
    if (exitCode === 12 && outcomeLine === "Error") {
      passed = true;
      detail = "reachable (counterexample found)";
    } else if (exitCode === 0 && outcomeLine === "NoError") {
      passed = false;
      detail = "UNREACHABLE (no counterexample in ${MAX_LENGTH} steps)";
    } else if (isDeadlock) {
      passed = false;
      detail = "DEADLOCK before reaching target";
    } else {
      passed = false;
      detail = `unexpected exit=${exitCode}`;
    }
  }
  return { check, passed, exitCode, durationMs, detail };
}
const tlaFiles = readdirSync(TLA_DIR).filter((f) => f.endsWith(".tla")).filter((f) => !moduleFilter || basename(f, ".tla") === moduleFilter).sort();
if (tlaFiles.length === 0) {
  console.error("No TLA+ specs found. Run generate.js first.");
  process.exit(1);
}
console.log(`Apalache MC - checking ${tlaFiles.length} specs (depth=${MAX_LENGTH})
`);
let totalChecks = 0;
let totalPassed = 0;
let totalFailed = 0;
const failures = [];
for (const file of tlaFiles) {
  const module = basename(file, ".tla");
  const tlaPath = join(TLA_DIR, file);
  const { holdInvs, failInvs, customInvs } = parseInvariants(tlaPath);
  const checks = [
    ...holdInvs.map((inv) => ({ module, invariant: inv, kind: "invariant_must_hold" })),
    ...customInvs.map((inv) => ({ module, invariant: inv, kind: "invariant_must_hold" })),
    ...failInvs.map((inv) => ({ module, invariant: inv, kind: "invariant_must_fail" }))
  ];
  console.log(`--- ${module} (${checks.length} checks) ---`);
  for (const check of checks) {
    totalChecks++;
    const result = await runCheck(check);
    const icon = result.passed ? "\x1B[32m+\x1B[0m" : "\x1B[31m!\x1B[0m";
    console.log(`  ${icon} ${check.invariant}  ${result.detail}  (${result.durationMs}ms)`);
    if (result.passed) {
      totalPassed++;
    } else {
      totalFailed++;
      failures.push(result);
    }
  }
  console.log();
}
console.log(`
${"=".repeat(60)}`);
console.log(`Total: ${totalChecks} checks, ${totalPassed} passed, ${totalFailed} failed`);
if (failures.length > 0) {
  console.log(`
Failures:`);
  for (const f of failures) {
    console.log(`  ${f.check.module}.${f.check.invariant}: ${f.detail}`);
  }
  process.exit(1);
}
console.log(`
All checks passed.`);
