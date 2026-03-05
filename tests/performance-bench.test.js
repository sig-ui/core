// @ts-check

/**
 * Repository module for performance bench.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { generateBundleCSS } from "../../cli/src/generators/bundle.js";
import { generateTokenCSS } from "../../cli/src/generators/css.js";
import { generateTypeScriptTokens } from "../../cli/src/generators/typescript.js";
import { minifyCSS } from "../../cli/src/generators/minify-css.js";
import { lintCSS } from "../src/performance/index.js";
import {
  DEFAULT_CSS_BUDGET,
  DEFAULT_JS_BUDGET
} from "../src/performance/index.js";
function gzipSize(text) {
  return Bun.gzipSync(new TextEncoder().encode(text)).byteLength;
}
function rawSize(text) {
  return new TextEncoder().encode(text).byteLength;
}
async function bundleMinGzipSize(entrypoint) {
  const script = `
    const CORE_PATH = "${new URL("../src/index.js", import.meta.url).pathname}";
    const result = await Bun.build({
      entrypoints: [${JSON.stringify(entrypoint)}],
      minify: true,
      target: "browser",
      plugins: [{
        name: "workspace",
        setup(build) {
          build.onResolve({ filter: /^@sig-ui\\/core/ }, () => ({ path: CORE_PATH }));
        },
      }],
    });
    if (!result.success) { process.exit(1); }
    const code = await result.outputs[0].text();
    const gz = Bun.gzipSync(new TextEncoder().encode(code)).byteLength;
    process.stdout.write(String(gz));
  `;
  const proc = Bun.spawn(["bun", "-e", script], { stdout: "pipe" });
  const output = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;
  if (exitCode !== 0)
    throw new Error(`Bundle subprocess failed`);
  return parseInt(output, 10);
}
const CONFIG = { brand: "#6366f1" };
describe("S7.1: sigui.css bundle (build output)", () => {
  test("sigui.css gzipped <=50KB", async () => {
    const css = await generateBundleCSS(CONFIG);
    expect(gzipSize(css)).toBeLessThanOrEqual(DEFAULT_CSS_BUDGET.maxTotalGzipped);
  });
});
describe("S7.1: tokens.css critical (inlined in <head>)", () => {
  test("tokens.css minified <=14KB (initial TCP window)", () => {
    const css = minifyCSS(generateTokenCSS(CONFIG));
    expect(rawSize(css)).toBeLessThanOrEqual(DEFAULT_CSS_BUDGET.maxCriticalInlined);
  });
});
describe("S7.1: CSS layer files <= maxPerComponent * N gzipped", () => {
  const STYLE_DIR = new URL("../../components/src/styles", import.meta.url).pathname;
  const COMPONENTS_DIR = new URL("../../components/src/components", import.meta.url).pathname;
  test("per-component CSS files average gzipped bytes <= budget", async () => {
    const { Glob } = await import("bun");
    const glob = new Glob("**/*.css");
    const files = [];
    for await (const file of glob.scan({ cwd: COMPONENTS_DIR, absolute: true })) {
      files.push(file);
    }
    const contents = await Promise.all(files.map((f) => Bun.file(f).text()));
    const allCSS = contents.join(`
`);
    const componentCount = files.length || 1;
    expect(gzipSize(allCSS)).toBeLessThanOrEqual(DEFAULT_CSS_BUDGET.maxPerComponent * componentCount);
  });
  for (const file of ["utilities.css", "animations.css"]) {
    test(`${file} average gzipped bytes per component <= budget`, async () => {
      const content = await Bun.file(`${STYLE_DIR}/${file}`).text();
      const componentCount = (content.match(/^\s+\/\* [A-Z][A-Za-z]+ /gm) || []).length || 1;
      expect(gzipSize(content)).toBeLessThanOrEqual(DEFAULT_CSS_BUDGET.maxPerComponent * componentCount);
    });
  }
});
describe("S8.1: @sig-ui/dom runtime (with tree-shaken core deps)", () => {
  const DOM_ENTRY = new URL("../../dom/src/index.js", import.meta.url).pathname;
  test("@sig-ui/dom minified+gzipped <=15KB", async () => {
    const gz = await bundleMinGzipSize(DOM_ENTRY);
    expect(gz).toBeLessThanOrEqual(DEFAULT_JS_BUDGET.maxDomRuntimeGzipped);
  });
});
describe("S8.1: generated tokens.ts (minified + gzipped)", () => {
  test("tokens.ts minified+gzipped <=2KB", async () => {
    const ts = generateTypeScriptTokens(CONFIG);
    const tmp = "/tmp/sigui-bench-tokens.ts";
    await Bun.write(tmp, ts);
    const gz = await bundleMinGzipSize(tmp);
    expect(gz).toBeLessThanOrEqual(DEFAULT_JS_BUDGET.maxTokensGzipped);
  });
});
describe("S8.1: total JS network transfer", () => {
  const DOM_ENTRY = new URL("../../dom/src/index.js", import.meta.url).pathname;
  test("dom runtime + tokens combined <=15KB", async () => {
    const domGz = await bundleMinGzipSize(DOM_ENTRY);
    const ts = generateTypeScriptTokens(CONFIG);
    const tmp = "/tmp/sigui-bench-tokens.ts";
    await Bun.write(tmp, ts);
    const tokensGz = await bundleMinGzipSize(tmp);
    expect(domGz + tokensGz).toBeLessThanOrEqual(DEFAULT_JS_BUDGET.maxTotalInitialGzipped);
  });
});
describe("S8.2: Theme initialization <=50ms", () => {
  test("generateTokenCSS p95 of 200 runs <=50ms", () => {
    const times = [];
    generateTokenCSS(CONFIG);
    for (let i = 0;i < 200; i++) {
      const t0 = performance.now();
      generateTokenCSS(CONFIG);
      times.push(performance.now() - t0);
    }
    times.sort((a, b) => a - b);
    const p95 = times[Math.floor(times.length * 0.95)];
    expect(p95).toBeLessThanOrEqual(50);
  });
});
describe("S9.2: Design system CSS lint compliance", () => {
  const STYLE_DIR = new URL("../../components/src/styles", import.meta.url).pathname;
  const COMPONENTS_DIR = new URL("../../components/src/components", import.meta.url).pathname;
  test("per-component CSS files have zero lint errors", async () => {
    const { Glob } = await import("bun");
    const glob = new Glob("**/*.css");
    const files = [];
    for await (const file of glob.scan({ cwd: COMPONENTS_DIR, absolute: true })) {
      files.push(file);
    }
    for (const file of files.sort()) {
      const content = await Bun.file(file).text();
      const errors = lintCSS(content).filter((r) => r.severity === "error");
      if (errors.length > 0)
        console.log(`${file}:`, errors);
      expect(errors).toHaveLength(0);
    }
  });
  for (const file of ["utilities.css", "animations.css", "shared-keyframes.css", "shared-states.css", "globals.css"]) {
    test(`${file} has zero lint errors`, async () => {
      const content = await Bun.file(`${STYLE_DIR}/${file}`).text();
      const errors = lintCSS(content).filter((r) => r.severity === "error");
      if (errors.length > 0)
        console.log(`${file}:`, errors);
      expect(errors).toHaveLength(0);
    });
  }
  test("generated token CSS has zero lint errors", () => {
    const css = generateTokenCSS(CONFIG);
    const errors = lintCSS(css).filter((r) => r.severity === "error");
    expect(errors).toHaveLength(0);
  });
  test("generated bundle CSS has zero lint errors", async () => {
    const css = await generateBundleCSS(CONFIG);
    const errors = lintCSS(css).filter((r) => r.severity === "error");
    expect(errors).toHaveLength(0);
  });
});
