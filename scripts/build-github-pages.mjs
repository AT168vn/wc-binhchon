import { access, rename } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const backups = [];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function moveAside(from, to) {
  if (!(await exists(from))) {
    return;
  }
  await rename(from, to);
  backups.push([from, to]);
}

async function restore() {
  for (const [from, to] of backups.reverse()) {
    await rename(to, from);
  }
}

function runNextBuild() {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const command = isWindows ? 'npx.cmd' : 'npx';
    const child = spawn(command, ['next', 'build'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        GITHUB_PAGES: 'true',
      },
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`next build failed with exit code ${code}`));
    });
  });
}

async function main() {
  try {
    // Static export không hỗ trợ middleware và Route Handlers (/api).
    await moveAside('src/app/api', 'src/app/_api_github_pages_backup');
    await moveAside('src/middleware.ts', 'src/_middleware.github-pages.bak.ts');

    await runNextBuild();
    console.log('\nGitHub Pages build completed. Output: ./out\n');
  } finally {
    await restore();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
