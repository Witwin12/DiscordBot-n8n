import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const testFiles = [
  'tests/test-config.js',
  'tests/test-commands.js',
  'tests/test-music.js'
];

console.log('🚀 Starting test suite...');

let allPassed = true;

testFiles.forEach(file => {
  console.log(`\nTesting ${file}...`);
  const result = spawnSync('node', [file], { stdio: 'inherit' });
  if (result.status !== 0) {
    allPassed = false;
    console.error(`❌ ${file} failed`);
  } else {
    console.log(`✅ ${file} passed`);
  }
});

if (allPassed) {
  console.log('\n✨ All tests passed successfully!');
  process.exit(0);
} else {
  console.error('\n❌ Some tests failed.');
  process.exit(1);
}
