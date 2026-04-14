import { spawn } from 'node:child_process';
import process from 'node:process';

function run(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      env
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`));
    });

    child.on('error', reject);
  });
}

async function main() {
  const node = process.execPath;

  await run(node, ['./scripts/feishu-sync.mjs', '--locale', 'zh']);
  await run(node, ['./scripts/translate-posts.mjs', 'changed']);
  await run(node, ['./scripts/feishu-publish-en.mjs']);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
