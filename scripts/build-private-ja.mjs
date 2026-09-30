import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

if (process.env.CF_PAGES || process.env.CI) {
  throw new Error("Japanese private previews must not run in hosted or CI builds.");
}

const cli = fileURLToPath(new URL("./run-astro.mjs", import.meta.url));
const child = spawn(process.execPath, [cli, "build"], {
  stdio: "inherit",
  env: { ...process.env, LOVESCAPE_PRIVATE_JA_PREVIEW: "local-only" },
});

child.on("exit", (code) => process.exit(code ?? 1));
