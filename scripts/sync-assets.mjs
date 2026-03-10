import { copyFile, access, constants, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const candidates = ['Avatar.jpg', 'Avatar.jpeg', 'Avatar.png', 'Avatar.webp'];

await mkdir(publicDir, { recursive: true });

for (const fileName of candidates) {
  const sourcePath = path.join(root, fileName);
  try {
    await access(sourcePath, constants.F_OK);
    const targetPath = path.join(publicDir, 'Avatar.jpg');
    await copyFile(sourcePath, targetPath);
    console.log(`Synced ${fileName} to public/Avatar.jpg`);
    process.exit(0);
  } catch {
    // Try next candidate.
  }
}

console.log('No Avatar image found at project root. Using fallback avatar-sponge.svg.');