#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

process.env.NEXT_FORCE_WEBPACK = '1';
process.env.NEXT_DISABLE_TURBOPACK = '1';
process.env.NODE_ENV = process.env.NODE_ENV ?? 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const nextBin = resolve(__dirname, '../node_modules/.bin/next');

const subprocess = spawn(nextBin, ['build', '--webpack'], {
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
});

subprocess.on('exit', code => {
  process.exit(code ?? 0);
});
