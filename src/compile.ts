import { join } from '@std/path';
import { APP_NAME } from './constants.ts';
import { buildSite } from './build.ts';

const ROOT_DIR = Deno.cwd();
const DIST_DIR = join(ROOT_DIR, 'dist');
const BIN_DIR = join(DIST_DIR, 'bin');

const targets = [
	'x86_64-unknown-linux-gnu',
	'aarch64-unknown-linux-gnu',
	'x86_64-apple-darwin',
	'aarch64-apple-darwin',
	'x86_64-pc-windows-msvc',
];

await buildSite();
await Deno.mkdir(BIN_DIR, { recursive: true });

for (const target of targets) {
	const platformDir = join(BIN_DIR, target);
	await Deno.mkdir(platformDir, { recursive: true });
	const isWindows = target.includes('windows');
	const filename = isWindows ? `${APP_NAME}.exe` : APP_NAME;
	const outputPath = join(platformDir, filename);

	const command = new Deno.Command('deno', {
		args: [
			'compile',
			'--target',
			target,
			'--allow-net',
			'--allow-read=dist/site',
			'--allow-run=open,xdg-open,cmd',
			'--output',
			outputPath,
			'--include',
			'dist/site/',
			'src/serve_dist.ts',
		],
		cwd: ROOT_DIR,
		stdout: 'inherit',
		stderr: 'inherit',
	});

	const { code } = await command.output();
	if (code !== 0) {
		throw new Error(`deno compile failed for ${target}`);
	}
}
