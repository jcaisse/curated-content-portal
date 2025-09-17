#!/usr/bin/env node

// Compute a deterministic hash for prisma/migrations
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function hashDir(dir) {
  const files = [];
  (function walk(d) {
    for (const name of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, name.name);
      if (name.isDirectory()) walk(p);
      else files.push(p);
    }
  })(dir);
  files.sort();
  const h = createHash('sha256');
  for (const f of files) {
    h.update(f.replace(dir, ''));               // path
    h.update('\0');
    h.update(readFileSync(f));                  // content
    h.update('\0');
  }
  return h.digest('hex');
}

const localHash = hashDir(join(process.cwd(), 'prisma', 'migrations'));
console.log(localHash);

