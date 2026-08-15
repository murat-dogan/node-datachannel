#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootPackageJson = require('../package.json');
const version = rootPackageJson.version;

const PLATFORMS = {
  'linux-x64-gnu': {
    name: '@node-datachannel/linux-x64-gnu',
    os: ['linux'],
    cpu: ['x64'],
    libc: ['glibc'],
    description: 'Prebuilt native binary for node-datachannel (linux-x64-gnu)',
  },
  'linux-x64-musl': {
    name: '@node-datachannel/linux-x64-musl',
    os: ['linux'],
    cpu: ['x64'],
    libc: ['musl'],
    description: 'Prebuilt native binary for node-datachannel (linux-x64-musl/alpine)',
  },
  'linux-arm64-gnu': {
    name: '@node-datachannel/linux-arm64-gnu',
    os: ['linux'],
    cpu: ['arm64'],
    libc: ['glibc'],
    description: 'Prebuilt native binary for node-datachannel (linux-arm64-gnu)',
  },
  'linux-arm64-musl': {
    name: '@node-datachannel/linux-arm64-musl',
    os: ['linux'],
    cpu: ['arm64'],
    libc: ['musl'],
    description: 'Prebuilt native binary for node-datachannel (linux-arm64-musl/alpine)',
  },
  'darwin-arm64': {
    name: '@node-datachannel/darwin-arm64',
    os: ['darwin'],
    cpu: ['arm64'],
    description: 'Prebuilt native binary for node-datachannel (macOS Apple Silicon)',
  },
  'darwin-x64': {
    name: '@node-datachannel/darwin-x64',
    os: ['darwin'],
    cpu: ['x64'],
    description: 'Prebuilt native binary for node-datachannel (macOS Intel)',
  },
  'win32-x64-msvc': {
    name: '@node-datachannel/win32-x64-msvc',
    os: ['win32'],
    cpu: ['x64'],
    description: 'Prebuilt native binary for node-datachannel (Windows x64)',
  },
  'android-arm64': {
    name: '@node-datachannel/android-arm64',
    os: ['android'],
    cpu: ['arm64'],
    description: 'Prebuilt native binary for node-datachannel (Android Termux / Bionic arm64)',
  },
};

function packageTarget(targetKey, binaryPath) {
  const meta = PLATFORMS[targetKey];
  if (!meta) {
    console.error(`Unknown target key: ${targetKey}`);
    console.error(`Supported keys: ${Object.keys(PLATFORMS).join(', ')}`);
    process.exit(1);
  }

  const candidateDefaultPaths = [
    path.resolve(__dirname, '../build/node_datachannel.node'),
    path.resolve(__dirname, '../build/Release/node_datachannel.node'),
    path.resolve(__dirname, '../build/Debug/node_datachannel.node'),
  ];
  const foundDefault = candidateDefaultPaths.find((p) => fs.existsSync(p));
  const sourceBinary = binaryPath ? path.resolve(binaryPath) : (foundDefault || candidateDefaultPaths[0]);

  if (!fs.existsSync(sourceBinary)) {
    console.error(`Source binary not found at: ${sourceBinary}`);
    process.exit(1);
  }

  const targetDir = path.resolve(__dirname, `../npm/${targetKey}`);
  fs.mkdirSync(targetDir, { recursive: true });

  const destBinary = path.join(targetDir, 'node_datachannel.node');
  fs.copyFileSync(sourceBinary, destBinary);

  const pkgJson = {
    name: meta.name,
    version: version,
    description: meta.description,
    main: 'node_datachannel.node',
    files: ['node_datachannel.node'],
    repository: rootPackageJson.repository,
    license: rootPackageJson.license,
    os: meta.os,
    cpu: meta.cpu,
  };

  if (meta.libc) {
    pkgJson.libc = meta.libc;
  }

  fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(pkgJson, null, 2) + '\n');
  console.log(`Successfully prepared platform package: ${meta.name} at ${targetDir}`);
}

const args = process.argv.slice(2);
if (args.length > 0) {
  const target = args[0];
  const binary = args[1];
  packageTarget(target, binary);
} else {
  console.log('Usage: node scripts/prepare-platform-packages.js <target-name> [binary-path]');
  console.log('Available targets: ' + Object.keys(PLATFORMS).join(', '));
}
