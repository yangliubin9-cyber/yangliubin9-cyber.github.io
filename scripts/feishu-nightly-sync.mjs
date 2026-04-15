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

  await run(node, ['./scripts/feishu-sync.mjs', '--locale', 'zh', '--translate-en']);

  if (process.env.FEISHU_PUBLISH_EN_ENABLED === 'true') {
    await run(node, ['./scripts/feishu-publish-en.mjs']);
  } else {
    console.log('skip english Feishu publish: FEISHU_PUBLISH_EN_ENABLED is not true');
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
