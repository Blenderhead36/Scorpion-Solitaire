import { join } from '@std/path';
import { APP_NAME } from './constants.ts';

const ROOT_DIR = Deno.cwd();
const CLIENT_ENTRY = join(ROOT_DIR, 'src', 'client.ts');
const CACHE_DIR = join(ROOT_DIR, 'bin', 'deno_cache');
const BUNDLE_PATH = join(CACHE_DIR, 'client.bundle.js');

export function buildIndexHtml(scriptPath: string): string {
	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${APP_NAME}</title>
    <style>
      body { background: #0b1020; color: #e2e8f0; font-family: system-ui, sans-serif; }
      #overlay { position: fixed; inset: 24px auto auto 24px; font-size: 14px; letter-spacing: 0.06em; text-transform: uppercase; }
    </style>
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
	const server = Deno.serve({ port }, async (request: Request) => {
		const url = new URL(request.url);
		if (url.pathname === '/') {
			return new Response(buildIndexHtml('/client.bundle.js'), {
				headers: { 'content-type': 'text/html; charset=utf-8' },
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
