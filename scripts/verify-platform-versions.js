#!/usr/bin/env node
const path = require('path');
const pkg = require(path.resolve(__dirname, '../package.json'));

const expectedVersion = pkg.version;
const mismatches = [];

if (pkg.optionalDependencies) {
  for (const [dep, ver] of Object.entries(pkg.optionalDependencies)) {
    if (dep.startsWith('@node-datachannel/')) {
      if (ver !== expectedVersion) {
        mismatches.push(`${dep}: pinned to "${ver}", expected "${expectedVersion}"`);
      }
    }
  }
}

if (mismatches.length > 0) {
  console.error('\n❌ Version mismatch in optionalDependencies:');
  mismatches.forEach((m) => console.error(`   - ${m}`));
  console.error(
    `\nPlease update all @node-datachannel/* optionalDependencies in package.json to "${expectedVersion}".\n`
  );
  process.exit(1);
} else {
  console.log(`✓ All @node-datachannel optionalDependencies match package version (${expectedVersion})`);
}
