const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xeeeeee);
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

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 10, 2);
light.castShadow = true;
scene.add(light);

const tableGeometry = new THREE.PlaneGeometry(100, 100);
const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
const table = new THREE.Mesh(tableGeometry, tableMaterial);
table.rotation.x = -Math.PI / 2;
table.receiveShadow = true;
scene.add(table);

const marbleGeometry = new THREE.SphereGeometry(2, 32, 32);
const marbleMaterial = new THREE.MeshStandardMaterial({ color: 0x3399ff });
const marble = new THREE.Mesh(marbleGeometry, marbleMaterial);
marble.castShadow = true;
marble.position.set(0, 2, 0);
scene.add(marble);


function animate() {
  requestAnimationFrame(animate);
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
