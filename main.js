import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const aspect = window.innerWidth / window.innerHeight;
const d = 20;
const camera = new THREE.OrthographicCamera(
    -d * aspect, d * aspect,
    d, -d,
    0.1, 1000
);
camera.position.set(0, 50, 0);
camera.lookAt(0, 0, 0);

// Checkerboard texture
function generateCheckerTexture(size = 512, squares = 8) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const squareSize = size / squares;
    for (let y = 0; y < squares; y++) {
        for (let x = 0; x < squares; x++) {
            ctx.fillStyle = (x + y) % 2 === 0 ? '#dddddd' : '#ffffff';
            ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
        }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    return texture;
}

const checkerTexture = generateCheckerTexture();

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 10, 2);
light.castShadow = true;
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Table with checkerboard
const tableGeometry = new THREE.PlaneGeometry(100, 100);
const tableMaterial = new THREE.MeshStandardMaterial({
    map: checkerTexture,
    roughness: 1,
    metalness: 0,
});
const table = new THREE.Mesh(tableGeometry, tableMaterial);
table.rotation.x = -Math.PI / 2;
table.receiveShadow = true;
scene.add(table);

// Fake envMap using the same checker
const envMap = checkerTexture;

// Glass marble
const marbleGeometry = new THREE.SphereGeometry(2, 64, 64);
const marbleMaterial = new THREE.MeshPhysicalMaterial({
    roughness: 0,
    metalness: 0,
    transmission: 1,
    thickness: 1.5,
    transparent: true,
    opacity: 1,
    ior: 1.5,
    envMap: envMap,
    envMapIntensity: 1,
    reflectivity: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0,
});

const marble = new THREE.Mesh(marbleGeometry, marbleMaterial);
marble.castShadow = true;
marble.position.set(0, 2, 0);
scene.add(marble);

function animate() {
    requestAnimationFrame(animate);
    marble.rotation.y += 0.005;
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -d * aspect;
    camera.right = d * aspect;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});