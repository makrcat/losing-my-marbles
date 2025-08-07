//@ts-check

import { isKeyDown } from "./game_engine.js";
import { Rect, Circle, Line } from "./game_engine.js";
import { startGame, gameCanvas } from "./game_utils.js";

///////////////////define variables/////////////////////
let square = new Rect(gameCanvas.ctx, 10, 10, 50, 50, "purple");
square.fill = false;
square.borderColor = "purple";
square.border = true;
square.lineWidth = 2;

let circle = new Circle(gameCanvas.ctx, 100, 100, 20, "red");
circle.fill = true;

let line = new Line(gameCanvas.ctx);

document.onmousemove = updateCoordinates;
let clientX = 0;
let clientY = 0;

function updateCoordinates(e) {
  clientX = e.clientX;
  clientY = e.clientY;
  console.log("Mouse coordinates", clientX, clientY);
}

//////////////////game!////////////////////////////////

export function gameLoop() {
  circle.centerX = clientX;
  circle.centerY = clientY;

  if ((isKeyDown["ArrowLeft"] || isKeyDown["a"]) && square.leftEdge > 0) {
    square.x -= 5;
  }

  //@ts-ignore
  if ((isKeyDown["ArrowRight"] || isKeyDown["d"]) && square.rightEdge < canvas.width) {
    square.x += 5;
  }

  if ((isKeyDown["ArrowUp"] || isKeyDown["w"]) && square.topEdge > 0) {
    square.y -= 5;
  }

  //@ts-ignore
  if ((isKeyDown["ArrowDown"] || isKeyDown["s"]) && square.bottomEdge < canvas.height) {
    square.y += 5;
  }

  line.x2 = square.x + square.width / 2;
  line.y2 = square.y + square.height / 2;
  line.x1 = circle.centerX;
  line.y1 = circle.centerY;

  console.log(square.leftEdge, square.rightEdge, square.topEdge, square.bottomEdge);
}

startGame();
