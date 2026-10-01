import path from 'node:path';
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';

const BUILD_DIR = 'build';
const INDEX = 'index.html';
const SERVICE_WORKER = 'service-worker.js';

const EXCLUDED_FILES = ['asset-manifest.json', 'robots.txt', SERVICE_WORKER];
const EXCLUDED_SUFFIXES = ['.LICENSE.txt', '.map'];

function isPrecached(file) {
  return (
    !EXCLUDED_FILES.includes(file)
    && !EXCLUDED_SUFFIXES.some((suffix) => file.endsWith(suffix))
  );
}

async function getPrecachedFiles() {
  const entries = await readdir(BUILD_DIR, {
    recursive: true,
    withFileTypes: true,
  });

  return (
    entries
      .filter((entry) => entry.isFile())
      .map((entry) =>
        path.relative(BUILD_DIR, path.join(entry.parentPath, entry.name)),
      )
      .map((file) => file.split(path.sep).join('/'))
      .filter(isPrecached)
      .sort()
  );
}

async function getCacheVersion(files) {
  const hash = createHash('sha256');

  for (const file of files) {
    hash.update(file);
    hash.update(await readFile(path.join(BUILD_DIR, file)));
  }

  return hash.digest('hex').slice(0, 16);
}

function getUrl(file) {
  if (file === INDEX) {
    return '/';
  } else {
    return `/${file}`;
  }
}

async function main() {
  const files = await getPrecachedFiles();
  const cacheVersion = await getCacheVersion(files);
  const urls = files.map(getUrl);

  const serviceWorkerPath = path.join(BUILD_DIR, SERVICE_WORKER);
  const serviceWorker = await readFile(serviceWorkerPath, 'utf8');
  const precacheLine =
    `self.CACHE_VERSION = ${JSON.stringify(cacheVersion)};`
    + ` self.PRECACHE_URLS = ${JSON.stringify(urls)};\n`;

  await writeFile(serviceWorkerPath, precacheLine + serviceWorker);

  console.log(`Service worker precaches ${urls.length} files (${cacheVersion})`);
}

await main();
