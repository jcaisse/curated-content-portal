#!/usr/bin/env node

import { execSync } from 'node:child_process';
const image = process.argv[2];
if (!image) { console.error('usage: node scripts/validate-migrations-in-image.mjs <image>'); process.exit(2); }

const localHash = execSync('node scripts/migrations-hash.mjs').toString().trim();
const dockerCmd = `node -e "
const fs=require('fs');const p=require('path');const c=require('crypto');
function h(d){const f=[];(function w(x){for(const e of fs.readdirSync(x,{withFileTypes:true})){const P=p.join(x,e.name);e.isDirectory()?w(P):f.push(P)}})(d);
f.sort();const H=c.createHash('sha256');for(const F of f){H.update(F.replace(d,''));H.update('\\0');H.update(fs.readFileSync(F));H.update('\\0');}
process.stdout.write(H.digest('hex')); }
h('/app/prisma/migrations');
"`;
const imageHash = execSync(`docker run --rm ${image} ${dockerCmd}`, { stdio: ['ignore','pipe','inherit'] }).toString().trim();

if (localHash !== imageHash) {
  console.error('MIGRATIONS MISMATCH:\nlocal  :', localHash, '\nimage  :', imageHash);
  process.exit(1);
} else {
  console.log('Migrations OK:', localHash);
}
