//@ts-check

import { isKeyDown } from "./game_engine.js";
import { Rect, Circle, Line } from "./game_engine.js";
import { startGame, gameCanvas, canvasElement } from "./game_utils.js";

///////////////////define variables/////////////////////

document.onmousemove = updateCoordinates;
let clientX = 0;
let clientY = 0;

const friction = 0.02;
const angularFric = 0.04;

function updateCoordinates(e) {
  //@ts-ignore

  const canvasBB = canvasElement.getBoundingClientRect();

  //@ts-ignore
  clientX = e.clientX - parseInt(canvasBB.left);
  //@ts-ignore
  clientY = e.clientY - parseInt(canvasBB.top);

  console.log("Mouse coordinates", clientX, clientY);
}

function randomSpeed() {
  let speed = 2 + Math.random() * 2
  return Math.random() < 0.5 ? -speed : speed;
}

//////////////////game!////////////////////////////////
class RotatingCircle extends Circle {
  constructor(ctx, centerX, centerY, radius, color = "red") {
    super(ctx, centerX, centerY, radius, color);
    this.rotation = 0;
    this.angularV = 0;
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate(this.rotation);

    if (this.fill) {
      this.ctx.beginPath();
      this.ctx.fillStyle = this.color;
      this.ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
      this.ctx.fill();
    }

    if (this.border) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.borderColor;
      this.ctx.lineWidth = this.lineWidth;
      this.ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
      this.ctx.stroke();
    }

    this.ctx.beginPath();
    this.ctx.strokeStyle = "black";
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(this.radius, 0);
    this.ctx.stroke();

    this.ctx.restore();
  }

  updateDimensions() {
    this.centerX += this.vx;
    this.centerY += this.vy;
    this.rotation += this.angularV;
    this.rotation *= (1 - angularFric);
  }

}


function getRandomPosition(radius, width, height) {
  const x = radius + Math.random() * (width - 2 * radius);
  const y = radius + Math.random() * (height - 2 * radius);
  return { x, y };
}

const circles = [];
const circles_n = 15;

// positions based. faster
function any_overlap(one, circles) {
  for (const c of circles) {
    if (collision(one, c)) {
      return true;
    }
  }
  return false;
}

for (let i = 0; i < circles_n; i++) {
  let position;
  const radius = 20;

  position = getRandomPosition(radius, gameCanvas.width, gameCanvas.height);
  while (any_overlap({ centerX: position.x, centerY: position.y, radius }, circles)) {


    position = getRandomPosition(radius, gameCanvas.width, gameCanvas.height);

  }


  let circle = new RotatingCircle(gameCanvas.ctx, position.x, position.y, radius, `hsl(${i * 24}, 100%, 50%)`);
  circle.vx = randomSpeed();
  circle.vy = randomSpeed();
  circle.angularV = 0.1;
  circles.push(circle);

}

function applyFriction() {
  for (const circle of circles) {
    const speed = Math.sqrt(circle.vx * circle.vx + circle.vy * circle.vy);
    if (speed === 0) continue;

    if (speed <= 0.5) {
      // stop if friction would override speed
      // changed to: i can barely see movement so stop
      circle.vx = 0;
      circle.vy = 0;
    } else {

      circle.vx *= (1 - friction);
      circle.vy *= (1 - friction);
    }
  }
}

/**
 * circle collision
 * @param {Circle} c1
 * @param {Circle} c2
 * @returns {boolean} true if circles overlap
 */
function collision(c1, c2) {
  const dx = c1.centerX - c2.centerX;
  const dy = c1.centerY - c2.centerY;
  const radiusSum = c1.radius + c2.radius;
  return dx * dx + dy * dy <= radiusSum * radiusSum;
}


// same mass calculation
function updateV(c1, c2) {
  // angle of line between centers
  const dx = c2.centerX - c1.centerX;
  const dy = c2.centerY - c1.centerY;
  const theta = Math.atan2(dy, dx);

  const cos = Math.cos(theta);
  const sin = Math.sin(theta);

  // rotation matrix
  const v1x = c1.vx * cos + c1.vy * sin;
  const v1y = -c1.vx * sin + c1.vy * cos;
  const v2x = c2.vx * cos + c2.vy * sin;
  const v2y = -c2.vx * sin + c2.vy * cos;

  // "1d" collision : swap
  const newV1x = v2x;
  const newV2x = v1x;

  // rotation matrix back
  c1.vx = newV1x * cos - v1y * sin;
  c1.vy = newV1x * sin + v1y * cos;
  c2.vx = newV2x * cos - v2y * sin;
  c2.vy = newV2x * sin + v2y * cos;



  // gpt what do I do :/
  // Calculate relative velocity vector
  const relVx = c2.vx - c1.vx;
  const relVy = c2.vy - c1.vy;


  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = dx / dist;
  const ny = dy / dist;

  // Tangent vector perpendicular to normal
  const tx = -ny;
  const ty = nx;

  // Relative velocity along tangent
  const relVTangent = relVx * tx + relVy * ty;

  // Apply some spin impulse proportional to relVTangent
  // Adjust this factor to tune spin effect strength
  const spinFactor = 0.1;

  c1.angularV -= spinFactor * relVTangent;
  c2.angularV += spinFactor * relVTangent;
}





const outline = {
  centerX: 0,
  centerY: 0,
  radius: 22, 
  visible: false
};

let dragging = false;
let draggedCircle = null;
let dragStartX = 0;
let dragStartY = 0;

function updateOutline() {
  if (dragging) {
    outline.visible = false;
    return;
  }
  let found = false;
  for (const c of circles) {
    const dx = c.centerX - clientX;
    const dy = c.centerY - clientY;
    if (dx * dx + dy * dy <= c.radius * c.radius) {
      outline.centerX = c.centerX;
      outline.centerY = c.centerY;
      outline.visible = true;
      found = true;
      break;
    }
  }
  if (!found) {
    outline.visible = false;
  }
}


//@ts-ignore
canvasElement.addEventListener('mousedown', (e) => {
  //@ts-ignore
  const rect = canvasElement.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  for (const c of circles) {
    const dx = c.centerX - mouseX;
    const dy = c.centerY - mouseY;
    if (dx * dx + dy * dy <= c.radius * c.radius) {
      dragging = true;
      draggedCircle = c;
      dragStartX = mouseX;
      dragStartY = mouseY;

      // Freeze velocity while dragging
      c.vx = 0;
      c.vy = 0;
      break;
    }
  }
});

//@ts-ignore
document.addEventListener('mouseup', (e) => {
  if (!dragging || !draggedCircle) return;

  //@ts-ignore
  const rect = canvasElement.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const dragDX = mouseX - dragStartX;
  const dragDY = mouseY - dragStartY;
  const dragDist = Math.sqrt(dragDX * dragDX + dragDY * dragDY);

  const minSpeed = 0.1;
  const maxSpeed = 10;

  // Normalize drag distance into speed (adjust denominator for sensitivity)
  let speed = Math.min(dragDist / 20, maxSpeed);
  speed = Math.max(speed, minSpeed);

  // Normalize drag direction
  const dirX = dragDX / dragDist || 0;
  const dirY = dragDY / dragDist || 0;

  // Assign velocity to circle
  draggedCircle.vx = dirX * speed;
  draggedCircle.vy = dirY * speed;

  // Optional: add angular velocity proportional to speed
  draggedCircle.angularV += speed * 0.05;

  dragging = false;
  draggedCircle = null;
});



function drawOutline(ctx) {
  if (!outline.visible) return;
  ctx.save();
  ctx.setLineDash([2, 6]);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(outline.centerX, outline.centerY, outline.radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}






export function gameLoop() {

  for (let i = 0; i < circles.length; i++) {
    circles[i].border = false;
  }


  for (let i = 0; i < circles.length; i++) {
    let circle = circles[i];

    // collide with wall

    if (circle.centerX - circle.radius <= 0 && circle.vx < 0) {
      circle.border = true;
      circle.vx *= -1;
    } else if (circle.centerX + circle.radius >= gameCanvas.width && circle.vx > 0) {
      circle.border = true;
      circle.vx *= -1;
    }

    if (circle.centerY - circle.radius <= 0 && circle.vy < 0) {
      circle.border = true;
      circle.vy *= -1;
    } else if (circle.centerY + circle.radius >= gameCanvas.height && circle.vy > 0) {
      circle.border = true;
      circle.vy *= -1;
    }
  }

  // check against each other once
  for (let i = 0; i < circles.length - 1; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      if (collision(circles[i], circles[j])) {
        circles[i].border = true;
        circles[j].border = true;

        // do not stick
        const dx = circles[j].centerX - circles[i].centerX;
        const dy = circles[j].centerY - circles[i].centerY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1; // avoid div by 0
        const overlap = (circles[i].radius + circles[j].radius) - dist;

        const nx = dx / dist;
        const ny = dy / dist;

        circles[i].centerX -= nx * overlap / 2;
        circles[i].centerY -= ny * overlap / 2;
        circles[j].centerX += nx * overlap / 2;
        circles[j].centerY += ny * overlap / 2;

        updateV(circles[i], circles[j]);
      }

    }
  }



  // physics:
  applyFriction();


  updateOutline();
  drawOutline(gameCanvas.ctx);

}

startGame();
