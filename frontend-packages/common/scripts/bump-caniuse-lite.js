#!/bin/node

// Script bumps caniuse-lite in common/config/rush/pnpm-lock.yaml

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

async function main() {
  const repoRoot = path.join(__dirname, "../../");
  const pathToPnpmLockFile = path.join(repoRoot, "common/config/rush/pnpm-lock.yaml");

  const pnpmLockfileText = fs.readFileSync(pathToPnpmLockFile).toString();

  const version = execSync("npm view caniuse-lite version").toString().trim();
  const sha = execSync("npm view caniuse-lite dist.integrity").toString().trim();

  if (!/\d+\.\d+\.\d+/.test(version)) {
    throw new Error('did not get a suitable version from "npm view" command');
  }

  const versionRegex = /caniuse-lite: \d+\.\d+\.\d+/g;
  const versionMatches = pnpmLockfileText.match(versionRegex);

  const shaRegex = /\/caniuse-lite\/\d+\.\d+\.\d+\:[\n\r]\s+resolution:\s+\{integrity:\s+.+\}/gm;
  const shaMatches = pnpmLockfileText.match(shaRegex);

  console.log(
    `Found ${versionMatches.length} matches of caniuse-lite in pnpm-lock.yaml, to replace with ${version}.`
  );

  console.log(
    `Found ${shaMatches.length} integrity matches of caniuse-lite in pnpm-lock.yaml, to replace with ${sha}.`
  );

  const updatedPnpmLockfile = pnpmLockfileText.replace(
    versionRegex,
    "caniuse-lite: " + version
  ).replace(
    shaRegex,
    `/caniuse-lite/${version}:
    resolution: {integrity: ${sha}}`
  );

  fs.writeFileSync(pathToPnpmLockFile, updatedPnpmLockfile);

  console.log(
    `Updated pnpm-lock.yaml with latest caniuse-lite version ${version}. Now you can run rush update and/or commit this change to get rid of annyong caniuse-lite warnings.`
  );
}

main();
