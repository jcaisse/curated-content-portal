const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getSha() {
  try { return execSync('git rev-parse --short HEAD').toString().trim(); }
  catch { return 'unknown'; }
}

function main() {
  const sha = process.env.GIT_COMMIT_SHA || getSha();
  const info = {
    sha,
    builtAt: new Date().toISOString()
  };
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'build-info.json'), JSON.stringify(info, null, 2));
  console.log('Wrote public/build-info.json', info);
}

main();






