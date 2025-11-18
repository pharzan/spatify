import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawn } from "node:child_process";

function run(command, args) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("close", (code) => {
      if (code === 0) resolvePromise(undefined);
      else rejectPromise(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function main() {
  const specUrl = process.env.OPENAPI_SPEC_URL ?? "http://localhost:3333/docs/json-app";
  const outputPath = resolve(process.cwd(), "src/generated/api-types.ts");

  await mkdir(dirname(outputPath), { recursive: true });

  console.log(`Generating API types from ${specUrl}`);
  await run("npx", ["openapi-typescript", specUrl, "--output", outputPath]);
  console.log(`Types saved to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
