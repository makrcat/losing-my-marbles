//@ts-check

import { GameCanvas } from "./game_engine.js";
import { gameLoop } from "./game_loop.js";

let fps = 30;
let now;
let then = Date.now();
let interval = 1000/fps;
let delta;


export const canvasElement = document.getElementById("canvas");
export const gameCanvas = new GameCanvas(canvasElement);

//////////////////game!////////////////////////////////

export function startGame() {
  //clear(ctx);
  
  requestAnimationFrame(startGame);
  now = Date.now();
  delta = now - then;

  if (delta > interval) {
    then = now - (delta % interval);

    gameCanvas.clear();
    gameCanvas.updateFrame();

    gameLoop();
  }
}
