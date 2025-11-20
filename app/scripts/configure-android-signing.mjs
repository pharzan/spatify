#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");
const gradlePropertiesPath = resolve(rootDir, "android", "gradle.properties");

const REQUIRED_ARGS = [
  ["--store-file", "MYAPP_RELEASE_STORE_FILE"],
  ["--store-password", "MYAPP_RELEASE_STORE_PASSWORD"],
  ["--key-alias", "MYAPP_RELEASE_KEY_ALIAS"],
  ["--key-password", "MYAPP_RELEASE_KEY_PASSWORD"],
];

function parseArgs() {
  const args = process.argv.slice(2);
  const values = new Map();

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];

    const entry = REQUIRED_ARGS.find(([flag]) => flag === arg);
    if (!entry) {
      continue;
    }

    if (typeof next !== "string") {
      throw new Error(`Missing value for ${arg}`);
    }

    values.set(entry[1], next);
    i += 1;
  }

  const missing = REQUIRED_ARGS.filter(([, key]) => !values.has(key));
  if (missing.length > 0) {
    const usage = REQUIRED_ARGS.map(([flag]) => flag + " <value>").join(" ");
    throw new Error(
      `Missing required arguments: ${missing
        .map(([, key]) => key)
        .join(", ")}\nUsage: node ./scripts/configure-android-signing.mjs ${usage}`
    );
  }

  return values;
}

function ensureGradleProperties() {
  if (existsSync(gradlePropertiesPath)) {
    return readFileSync(gradlePropertiesPath, "utf8");
  }

  console.log(
    "android/gradle.properties not found. Running `npx expo prebuild --platform android --no-install` to generate native files..."
  );
  const result = spawnSync(
    "npx",
    ["expo", "prebuild", "--platform", "android", "--no-install"],
    { cwd: rootDir, stdio: "inherit" }
  );

  if (result.status !== 0) {
    throw new Error("Expo prebuild failed. Please fix the errors above and rerun the script.");
  }

  if (!existsSync(gradlePropertiesPath)) {
    throw new Error(
      `expo prebuild completed but android/gradle.properties is still missing at ${gradlePropertiesPath}`
    );
  }

  return readFileSync(gradlePropertiesPath, "utf8");
}

function upsertProperty(contents, key, value) {
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(contents)) {
    return contents.replace(pattern, `${key}=${value}`);
  }

  const newline = contents.endsWith("\n") ? "" : "\n";
  return `${contents}${newline}${key}=${value}\n`;
}

try {
  const values = parseArgs();
  let gradleContents = ensureGradleProperties();

  values.forEach((value, key) => {
    gradleContents = upsertProperty(gradleContents, key, value);
  });

  writeFileSync(gradlePropertiesPath, gradleContents, "utf8");
  console.log(
    `Updated ${gradlePropertiesPath} with release signing credentials:\n${Array.from(
      values.keys()
    ).join(", ")}`
  );
  console.log(
    "Remember to keep this file out of version control and rerun the script if the credentials change."
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
