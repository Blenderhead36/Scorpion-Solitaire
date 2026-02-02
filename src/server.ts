import { join } from '@std/path';
import { debounce } from '@std/async/debounce';
import { APP_NAME } from './constants.ts';

const ROOT_DIR = Deno.cwd();
const SRC_DIR = join(ROOT_DIR, 'src');
const CLIENT_ENTRY = join(ROOT_DIR, 'src', 'client.ts');
const CACHE_DIR = join(ROOT_DIR, 'bin', 'deno_cache');
const BUNDLE_PATH = join(CACHE_DIR, 'client.bundle.js');

const reloadListeners = new Set<ReadableStreamDefaultController<Uint8Array>>();

function notifyReload(): void {
	const message = new TextEncoder().encode('data: reload\n\n');
	for (const controller of reloadListeners) {
		try {
			controller.enqueue(message);
		} catch {
			reloadListeners.delete(controller);
		}
	}
}

export function buildIndexHtml(scriptPath: string, liveReload = false): string {
	const liveReloadScript = liveReload
		? `
    <script>
      const es = new EventSource('/__reload');
      es.onmessage = () => location.reload();
      es.onerror = () => setTimeout(() => location.reload(), 1000);
    </script>`
		: '';
	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${APP_NAME}</title>
    <style>
      body { background: #0b1020; color: #e2e8f0; font-family: system-ui, sans-serif; }
      #overlay { position: fixed; inset: 24px auto auto 24px; font-size: 14px; letter-spacing: 0.06em; text-transform: uppercase; }
    </style>${liveReloadScript}
  </head>
  <body>
    <div id="overlay">${APP_NAME}</div>
    <script type="module" src="${scriptPath}"></script>
  </body>
</html>`;
}

export async function bundleClient(outputPath: string): Promise<void> {
	await Deno.mkdir(CACHE_DIR, { recursive: true });
	const command = new Deno.Command('deno', {
		args: ['bundle', '--output', outputPath, CLIENT_ENTRY],
		cwd: ROOT_DIR,
		stdout: 'inherit',
		stderr: 'inherit',
	});
	const { code } = await command.output();
	if (code !== 0) {
		throw new Error('deno bundle failed');
	}
}

export async function startServer(port = 8000): Promise<void> {
	await bundleClient(BUNDLE_PATH);

	const rebundle = debounce(async () => {
		console.log('File changed, rebundling...');
		try {
			await bundleClient(BUNDLE_PATH);
			console.log('Rebundle complete');
			notifyReload();
		} catch (error) {
			console.error('Rebundle failed:', error);
		}
	}, 100);

	const watcher = Deno.watchFs(SRC_DIR);
	(async () => {
		for await (const event of watcher) {
			if (event.kind === 'modify' || event.kind === 'create') {
				rebundle();
			}
		}
	})();

	const server = Deno.serve({ port }, async (request: Request) => {
		const url = new URL(request.url);
		if (url.pathname === '/') {
			return new Response(buildIndexHtml('/client.bundle.js', true), {
				headers: { 'content-type': 'text/html; charset=utf-8' },
			});
		}

		if (url.pathname === '/__reload') {
			let streamController: ReadableStreamDefaultController<Uint8Array>;
			const stream = new ReadableStream<Uint8Array>({
				start(controller) {
					streamController = controller;
					reloadListeners.add(controller);
				},
				cancel() {
					reloadListeners.delete(streamController);
				},
			});
			return new Response(stream, {
				headers: {
					'content-type': 'text/event-stream',
					'cache-control': 'no-cache',
					'connection': 'keep-alive',
				},
			});
		}

		if (url.pathname === '/client.bundle.js') {
			const bundle = await Deno.readFile(BUNDLE_PATH);
			return new Response(bundle, {
				headers: { 'content-type': 'application/javascript; charset=utf-8' },
			});
		}

		return new Response('Not found', { status: 404 });
	});

	console.log(`Server running at http://localhost:${server.addr.port}/`);
}

if (import.meta.main) {
	await startServer();
}
