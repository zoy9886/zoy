import { cp, writeFile } from 'node:fs/promises';
// Commit these outputs so Pages can also serve main / (root) without a build runner.
await cp(new URL('../dist/index.html', import.meta.url), new URL('../index.html', import.meta.url));
await cp(new URL('../dist/assets', import.meta.url), new URL('../assets', import.meta.url), { recursive: true });
await writeFile(new URL('../.nojekyll', import.meta.url), '');
