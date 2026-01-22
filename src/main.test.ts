import { assertStringIncludes } from '@std/assert';
import { buildIndexHtml } from './server.ts';
import { APP_NAME } from './constants.ts';

Deno.test('index html includes bundle script', () => {
	const html = buildIndexHtml('/client.bundle.js');
	assertStringIncludes(html, APP_NAME);
	assertStringIncludes(html, 'src="/client.bundle.js"');
});
