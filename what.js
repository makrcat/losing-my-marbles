import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';


const scene = new THREE.Scene();

const width = 540;
const height = 540;
const aspect = 1;
const d = 35;


const camera = new THREE.OrthographicCamera(
    -20 * aspect, 20 * aspect,
    20, -20,
    0.1, 1000
);
camera.position.set(0, 50, 0);
camera.lookAt(0, 0, 0);


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 50, 10);
light.castShadow = true;
light.shadow.mapSize.width = 1024,
light.shadow.mapSize.height = 1024,
light.shadow.camera.left = -d;
light.shadow.camera.right = d;
light.shadow.camera.top = d;
light.shadow.camera.bottom = -d;
light.shadow.camera.near = 1;
light.shadow.camera.far = 100;
light.shadow.bias = -0.001;
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);



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






















const friction = 0.02;
const angularFric = 0.02;
const circles_n = 15;
const radius = 2; 


function randomSpeed() {
    let speed =  1.5*Math.random() * 1;
    return Math.random() < 0.5 ? -speed : speed;
}

function collision(c1, c2) {
    const dx = c1.position.x - c2.position.x;
    const dz = c1.position.z - c2.position.z;
    const radiusSum = c1.userData.radius + c2.userData.radius;
    return dx * dx + dz * dz <= radiusSum * radiusSum;
}











// GPT translated this:
function updateV(c1, c2) {
    // Calculate difference in positions along X and Z axes
    const deltaX = c2.position.x - c1.position.x;
    const deltaZ = c2.position.z - c1.position.z;

    // Calculate the angle of the line connecting c1 to c2 relative to the X axis
    const collisionAngle = Math.atan2(deltaZ, deltaX);

    // Calculate cosine and sine of the collision angle for coordinate rotation
    const cosAngle = Math.cos(collisionAngle);
    const sinAngle = Math.sin(collisionAngle);

    // Rotate velocities of c1 into collision coordinate system
    const velocityC1AlongCollision = c1.userData.vx * cosAngle + c1.userData.vz * sinAngle;
    const velocityC1PerpCollision = -c1.userData.vx * sinAngle + c1.userData.vz * cosAngle;

    // Rotate velocities of c2 into collision coordinate system
    const velocityC2AlongCollision = c2.userData.vx * cosAngle + c2.userData.vz * sinAngle;
    const velocityC2PerpCollision = -c2.userData.vx * sinAngle + c2.userData.vz * cosAngle;

    // Swap the velocities along the collision axis to simulate elastic collision
    const newVelocityC1AlongCollision = velocityC2AlongCollision;
    const newVelocityC2AlongCollision = velocityC1AlongCollision;

    // Rotate velocities back to world coordinates for c1
    c1.userData.vx = newVelocityC1AlongCollision * cosAngle - velocityC1PerpCollision * sinAngle;
    c1.userData.vz = newVelocityC1AlongCollision * sinAngle + velocityC1PerpCollision * cosAngle;

    // Rotate velocities back to world coordinates for c2
    c2.userData.vx = newVelocityC2AlongCollision * cosAngle - velocityC2PerpCollision * sinAngle;
    c2.userData.vz = newVelocityC2AlongCollision * sinAngle + velocityC2PerpCollision * cosAngle;

    // Calculate relative velocity between c2 and c1 after collision
    const relativeVelocityX = c2.userData.vx - c1.userData.vx;
    const relativeVelocityZ = c2.userData.vz - c1.userData.vz;

    // Calculate distance between c1 and c2 (avoid division by zero)
    const distance = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ) || 1;

    // Normalize collision normal vector components
    const normalX = deltaX / distance;
    const normalZ = deltaZ / distance;

    // Calculate tangent vector perpendicular to collision normal
    const tangentX = -normalZ;
    const tangentZ = normalX;

    // Calculate relative velocity along tangent direction
    const relativeVelocityTangent = relativeVelocityX * tangentX + relativeVelocityZ * tangentZ;

    // Spin impulse magnitude based on relative tangent velocity
    const spinImpulseFactor = 0.1;

    // Apply spin impulse to angular velocity of c1 and c2
    c1.userData.angularV -= spinImpulseFactor * relativeVelocityTangent;
    c2.userData.angularV += spinImpulseFactor * relativeVelocityTangent;
}







const circles = [];

function getRandomPosition(radius, width, height) {
    return {
        x: -width / 2 + radius + Math.random() * (width - 2 * radius),
        z: -height / 2 + radius + Math.random() * (height - 2 * radius),
    };
}

function any_overlap(pos, circles) {
    for (const c of circles) {
        const dx = pos.x - c.position.x;
        const dz = pos.z - c.position.z;
        const distSq = dx * dx + dz * dz;
        const radiusSum = radius * 2;
        if (distSq <= radiusSum * radiusSum) return true;
    }
    return false;
}







//spawn
for (let i = 0; i < circles_n; i++) {
    let position = getRandomPosition(radius, 40, 40);
    while (any_overlap(position, circles)) {
        position = getRandomPosition(radius, 40, 40);
    }

    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhysicalMaterial({
        roughness: 0,
        metalness: 0,
        transmission: 1,
        thickness: 1.5,
        transparent: true,
        opacity: 1,
        ior: 1.5,
        clearcoat: 1,
        clearcoatRoughness: 0,
        color: new THREE.Color(`hsl(${i * 24}, 100%, 50%)`)
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, radius, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = false;


    mesh.userData = {
        radius,
        vx: randomSpeed() * 0.5, 
        vz: randomSpeed() * 0.5,
        angularV: 0.1,
        rotation: 0,
    };

    circles.push(mesh);
    scene.add(mesh);
}


const floorSize = 40;


// same
function applyFriction() {
    for (const c of circles) {
        const speed = Math.sqrt(c.userData.vx * c.userData.vx + c.userData.vz * c.userData.vz);
        if (speed === 0) continue;
        if (speed <= friction) {
            c.userData.vx = 0;
            c.userData.vz = 0;
        } else {
            c.userData.vx *= (1 - friction);
            c.userData.vz *= (1 - friction);
        }

        c.userData.angularV *= (1 - angularFric);
    }
}







// gpt:
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


let dragging = false;
let draggedCircle = null;
let dragStartTime = 0;
let dragStartPoint = new THREE.Vector3();
let dragCurrentPoint = new THREE.Vector3();
let dragDirection = new THREE.Vector3();
let dragDistance = 0;
const beamLengthMax = 80;


function getMousePos(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}


function getMouseFloorPosition() {
    raycaster.setFromCamera(mouse, camera);
    const planeY = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(planeY, intersectPoint);
    return intersectPoint;
}


renderer.domElement.addEventListener('mousedown', (event) => {
    getMousePos(event);
    raycaster.setFromCamera(mouse, camera);
    // Check intersects with circles
    const intersects = raycaster.intersectObjects(circles);
    if (intersects.length > 0) {
        dragging = true;
        draggedCircle = intersects[0].object;
        dragStartTime = performance.now();
        dragStartPoint.copy(getMouseFloorPosition());
        dragCurrentPoint.copy(dragStartPoint);
        dragDistance = 0;


        draggedCircle.userData.vx = 0;
        draggedCircle.userData.vz = 0;
    }
});


document.addEventListener('mousemove', (event) => {
    if (!dragging || !draggedCircle) return;
    getMousePos(event);
    dragCurrentPoint.copy(getMouseFloorPosition());

    // Compute drag direction vector on XZ plane
    dragDirection.subVectors(dragCurrentPoint, dragStartPoint);
    dragDirection.y = 0;

    dragDistance = dragDirection.length();

    if (dragDistance > 0.001) {
        dragDirection.normalize();
    }
});


document.addEventListener('mouseup', (event) => {
    if (!dragging || !draggedCircle) return;

    const dragEndTime = performance.now();
    const dragDuration = (dragEndTime - dragStartTime) / 1000; // seconds


    const minSpeed = 0.1;
    const maxSpeed = 3;

    let speed = (dragDistance / beamLengthMax) * maxSpeed;
    speed = Math.max(speed, minSpeed);


    draggedCircle.userData.vx = dragDirection.x * speed;
    draggedCircle.userData.vz = dragDirection.z * speed;

    draggedCircle.userData.angularV += dragDuration * 0.5;

    dragging = false;
    draggedCircle = null;
});


const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.8
});
const outlineMesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.2, 32, 32),
    outlineMaterial
);
outlineMesh.visible = false;
scene.add(outlineMesh);

let currentlyHovered = null;

renderer.domElement.addEventListener('mousemove', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(circles);
    if (intersects.length > 0) {
        currentlyHovered = intersects[0].object;
        outlineMesh.visible = true;
    } else {
        currentlyHovered = null;
        outlineMesh.visible = false;
    }
});

// END gpt -------------------

function gameLoop() {

    for (const c of circles) {
        c.position.x += c.userData.vx;
        c.position.z += c.userData.vz;
        c.rotation.y += c.userData.angularV;

        if (c.position.x - radius <= -floorSize / 2 && c.userData.vx < 0) {
            c.userData.vx *= -1;
        } else if (c.position.x + radius >= floorSize / 2 && c.userData.vx > 0) {
            c.userData.vx *= -1;
        }
        if (c.position.z - radius <= -floorSize / 2 && c.userData.vz < 0) {
            c.userData.vz *= -1;
        } else if (c.position.z + radius >= floorSize / 2 && c.userData.vz > 0) {
            c.userData.vz *= -1;
        }
    }

    // collision
    for (let i = 0; i < circles.length - 1; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            if (collision(circles[i], circles[j])) {

                // separate overlapping spheres
                const dx = circles[j].position.x - circles[i].position.x;
                const dz = circles[j].position.z - circles[i].position.z;
                const dist = Math.sqrt(dx * dx + dz * dz) || 1;
                const overlap = (circles[i].userData.radius + circles[j].userData.radius) - dist;

                const nx = dx / dist;
                const nz = dz / dist;

                circles[i].position.x -= nx * overlap / 2;
                circles[i].position.z -= nz * overlap / 2;
                circles[j].position.x += nx * overlap / 2;
                circles[j].position.z += nz * overlap / 2;

                updateV(circles[i], circles[j]);
            }
        }
    }

    applyFriction();

    if (currentlyHovered) {
        outlineMesh.position.lerp(currentlyHovered.position, 1);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(gameLoop);

}

gameLoop();