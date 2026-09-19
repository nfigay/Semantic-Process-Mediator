#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const file = path.join(root, "publication", "versions.json");

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(file)) {
  fail(`missing ${path.relative(root, file)}`);
}

let registry;
try {
  registry = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (error) {
  fail(`invalid JSON: ${error.message}`);
}

if (registry.schemaVersion !== 1) fail("schemaVersion must be 1");
if (registry.product !== "BPMNSM") fail('product must be "BPMNSM"');
if (!Array.isArray(registry.releases)) fail("releases must be an array");

const identities = new Set();

for (const [index, release] of registry.releases.entries()) {
  const p = `releases[${index}]`;

  if (!release || typeof release !== "object" || Array.isArray(release)) {
    fail(`${p} must be an object`);
  }

  for (const key of ["identity", "maturity", "status"]) {
    if (typeof release[key] !== "string" || release[key].length === 0) {
      fail(`${p}.${key} must be a non-empty string`);
    }
  }

  if (identities.has(release.identity)) {
    fail(`duplicate identity: ${release.identity}`);
  }
  identities.add(release.identity);

  if (!release.source || typeof release.source !== "object" || Array.isArray(release.source)) {
    fail(`${p}.source is required`);
  }

  if (!/^[0-9a-f]{40}$/.test(release.source.commit || "")) {
    fail(`${p}.source.commit must be a full 40-character Git SHA`);
  }

  for (const key of ["supersedes", "successor"]) {
    const reference = release.lifecycle?.[key];
    if (reference !== undefined && typeof reference !== "string") {
      fail(`${p}.lifecycle.${key} must be a string when present`);
    }
    if (reference === release.identity) {
      fail(`${p}.lifecycle.${key} cannot reference itself`);
    }
  }

  for (const evidenceKey of ["ci", "deployment"]) {
    const entries = release.evidence?.[evidenceKey] ?? [];
    if (!Array.isArray(entries)) {
      fail(`${p}.evidence.${evidenceKey} must be an array`);
    }

    for (const [j, evidence] of entries.entries()) {
      const ep = `${p}.evidence.${evidenceKey}[${j}]`;
      if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
        fail(`${ep} must be an object`);
      }
      if (typeof evidence.provider !== "string" || !evidence.provider) {
        fail(`${ep}.provider is required`);
      }
      if (typeof evidence.reference !== "string" || !evidence.reference) {
        fail(`${ep}.reference is required`);
      }
      if (evidence.url !== undefined && typeof evidence.url !== "string") {
        fail(`${ep}.url must be a string when present`);
      }
    }
  }

  const compatibility = release.compatibility?.repositories ?? [];
  if (!Array.isArray(compatibility)) {
    fail(`${p}.compatibility.repositories must be an array`);
  }

  for (const [j, item] of compatibility.entries()) {
    const cp = `${p}.compatibility.repositories[${j}]`;
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      fail(`${cp} must be an object`);
    }
    if (typeof item.repository !== "string" || !item.repository) {
      fail(`${cp}.repository is required`);
    }
    if (typeof item.revision !== "string" || !item.revision) {
      fail(`${cp}.revision is required`);
    }
  }

  if (release.status === "published") {
    if (typeof release.source.tag !== "string" || !release.source.tag) {
      fail(`${p}.published release requires source.tag`);
    }
    if (typeof release.publication?.url !== "string" || !release.publication.url) {
      fail(`${p}.published release requires publication.url`);
    }
    if (typeof release.publishedAt !== "string" || !release.publishedAt) {
      fail(`${p}.published release requires publishedAt`);
    }
    if (!(release.evidence?.ci?.length)) {
      fail(`${p}.published release requires CI evidence`);
    }
    if (!(release.evidence?.deployment?.length)) {
      fail(`${p}.published release requires deployment evidence`);
    }
  }
}

const references = [];
for (const [index, release] of registry.releases.entries()) {
  for (const key of ["supersedes", "successor"]) {
    const reference = release.lifecycle?.[key];
    if (reference) references.push(`releases[${index}].lifecycle.${key}=${reference}`);
  }
}
for (const reference of references) {
  const identity = reference.split("=")[1];
  if (!identities.has(identity)) {
    fail(`lifecycle reference does not resolve: ${reference}`);
  }
}

console.log(`OK: publication registry valid (${registry.releases.length} nominal releases)`);
