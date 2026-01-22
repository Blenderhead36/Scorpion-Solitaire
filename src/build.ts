import { ensureDir } from '@std/fs';
import { join } from '@std/path';
import { buildIndexHtml, bundleClient } from './server.ts';

export async function buildSite(): Promise<void> {
	const ROOT_DIR = Deno.cwd();
	const DIST_DIR = join(ROOT_DIR, 'dist', 'site');
	const BUNDLE_PATH = join(DIST_DIR, 'client.bundle.js');
	const INDEX_PATH = join(DIST_DIR, 'index.html');

	await ensureDir(DIST_DIR);
	await bundleClient(BUNDLE_PATH);
	await Deno.writeTextFile(INDEX_PATH, buildIndexHtml('./client.bundle.js'));

	console.log('Built static site into ./dist/site');
}

if (import.meta.main) {
	await buildSite();
}
