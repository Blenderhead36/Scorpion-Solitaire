import * as THREE from 'three';

function createPlaidTexture(size = 256): THREE.CanvasTexture {
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d')!;

	// Base color
	ctx.fillStyle = '#1e3a5f';
	ctx.fillRect(0, 0, size, size);

	const stripes = [
		{ color: 'rgba(220, 38, 38, 0.7)', width: 24, spacing: 64 },
		{ color: 'rgba(22, 163, 74, 0.6)', width: 12, spacing: 64, offset: 32 },
		{ color: 'rgba(250, 250, 250, 0.4)', width: 4, spacing: 32 },
	];

	// Draw horizontal and vertical stripes with multiply-like blending
	ctx.globalCompositeOperation = 'source-over';
	for (const { color, width, spacing, offset = 0 } of stripes) {
		ctx.fillStyle = color;
		for (let i = offset; i < size; i += spacing) {
			ctx.fillRect(0, i, size, width); // horizontal
			ctx.fillRect(i, 0, width, size); // vertical
		}
	}

	const texture = new THREE.CanvasTexture(canvas);
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(4, 4);
	return texture;
}

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(globalThis.devicePixelRatio);
renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
renderer.setClearColor(0x0b1020);
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	60,
	globalThis.innerWidth / globalThis.innerHeight,
	0.1,
	100,
);
camera.position.set(0, 0, 6);

const ambient = new THREE.AmbientLight(0x404040, 1.2);
scene.add(ambient);
const key = new THREE.PointLight(0x6ee7ff, 3, 50);
key.position.set(6, 6, 6);
scene.add(key);
const rim = new THREE.PointLight(0xff6ef2, 2, 50);
rim.position.set(-6, -4, 4);
scene.add(rim);

const plaidTexture = createPlaidTexture();
const knot = new THREE.Mesh(
	new THREE.TorusKnotGeometry(1.2, 0.45, 220, 32),
	new THREE.MeshStandardMaterial({
		map: plaidTexture,
		metalness: 0.3,
		roughness: 0.4,
	}),
);
scene.add(knot);

const grid = new THREE.GridHelper(18, 24, 0x2dd4bf, 0x1f2937);
grid.position.y = -2.5;
scene.add(grid);

const onResize = () => {
	camera.aspect = globalThis.innerWidth / globalThis.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
};
globalThis.addEventListener('resize', onResize);

const tick = () => {
	knot.rotation.x += 0.006;
	knot.rotation.y += 0.01;
	knot.rotation.z += 0.004;
	renderer.render(scene, camera);
	requestAnimationFrame(tick);
};
tick();
