import { join } from '@std/path';

const ROOT_DIR = Deno.cwd();
const DIST_DIR = join(ROOT_DIR, 'dist', 'site');

const contentTypes: Record<string, string> = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
};

function getContentType(pathname: string): string {
	for (const [ext, type] of Object.entries(contentTypes)) {
		if (pathname.endsWith(ext)) {
			return type;
		}
	}
	return 'application/octet-stream';
}

const server = Deno.serve({ port: 8000 }, async (request: Request) => {
	const url = new URL(request.url);
	const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
	const filePath = join(DIST_DIR, pathname);

	try {
		const file = await Deno.readFile(filePath);
		return new Response(file, {
			headers: { 'content-type': getContentType(pathname) },
		});
	} catch (error) {
		if (error instanceof Deno.errors.NotFound) {
			return new Response('Not found', { status: 404 });
		}
		return new Response('Server error', { status: 500 });
	}
});

const url = `http://localhost:${server.addr.port}/`;
console.log(`Server running at ${url}`);

const openBrowser = async (target: string): Promise<void> => {
	try {
		if (Deno.build.os === 'darwin') {
			await new Deno.Command('open', { args: [target] }).output();
			return;
		}
		if (Deno.build.os === 'windows') {
			await new Deno.Command('cmd', { args: ['/c', 'start', target] }).output();
			return;
		}
		await new Deno.Command('xdg-open', { args: [target] }).output();
	} catch {
		// Ignore failures to open a browser.
	}
};

await openBrowser(url);
