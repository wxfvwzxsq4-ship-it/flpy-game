// =======================
// FLPY — app.js (full)
// =======================

let board;
const boardwidth  = 360;
const boardheight = 640;
let context;

// Bird
const birdwidth  = 34;
const birdheight = 24;
let birdimage;

let birdX = boardwidth / 8;
let birdY = boardheight / 2;

const bird = { x: birdX, y: birdY, width: birdwidth, height: birdheight };

// Pipes
let pipeArray   = [];
const pipewidth = 64;
const pipeheight = 512;
const pipeX = boardwidth;
let toppipeimg, bottompipeimg;

// Physics
let velocityX = -2; // pipes go left
let velocityY = 0;  // bird vertical speed
const gravity = 0.4;

// State
let score = 0;
let gameOver = false;
let hasEnded = false;          // avoid double end
let rafId = null;
let spawnTimeoutId = null;

// ---------- Setup ----------
window.onload = function () {
  board = document.getElementById("board");
  board.width = boardwidth;
  board.height = boardheight;
  context = board.getContext("2d");

  // Assets
  birdimage = new Image();
  birdimage.src = "./flpy.png";

  toppipeimg = new Image();
  toppipeimg.src = "./toppipe.png";

  bottompipeimg = new Image();
  bottompipeimg.src = "./bottompipe.png";

  // Start loop when bird image is ready (optional)
  birdimage.onload = () => {
    rafId = requestAnimationFrame(update);
  };

  // Spawn pipes
  scheduleNextPipe();

  // Controls
  document.addEventListener("keydown", onKeyDown);
  // Also allow click/touch to flap (mobile friendly)
  document.addEventListener("pointerdown", flap);
};

// ---------- Controls ----------
function onKeyDown(e) {
  if (e.code === "Space" || e.code === "ArrowUp") {
    flap();
  }
}

function flap() {
  if (gameOver) return;
  velocityY = -6;
}

// ---------- High score + End flow ----------
function saveHighScore(val) {
  const prev = Number(localStorage.getItem("flpy_highscore") || 0);
  if (val > prev) localStorage.setItem("flpy_highscore", String(val));
}

function onGameOver(finalScore) {
  saveHighScore(finalScore);
  // build URL safely to avoid missing ?score
  const url = new URL("./gameover.html", window.location.href);
  url.searchParams.set("score", String(finalScore));
  window.location.assign(url.toString());
}

function endGame() {
  if (hasEnded) return;
  hasEnded = true;
  gameOver = true;

  // stop anim/spawn as soon as possible
  if (rafId) cancelAnimationFrame(rafId);
  if (spawnTimeoutId) clearTimeout(spawnTimeoutId);

  const finalScore = Math.max(0, Math.floor(score));
  onGameOver(finalScore);
}

// ---------- Game loop ----------
function update() {
  rafId = requestAnimationFrame(update);

  // clear
  context.clearRect(0, 0, boardwidth, boardheight);

  if (gameOver) return;

  // Bird physics
  velocityY += gravity;
  bird.y = Math.max(bird.y + velocityY, 0);

  // Draw bird
  context.drawImage(birdimage, bird.x, bird.y, bird.width, bird.height);

  // Out of bottom => end
  if (bird.y > boardheight) {
    endGame();
    return;
  }

  // Pipes
  for (let i = 0; i < pipeArray.length; i++) {
    const pipe = pipeArray[i];
    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    // Scoring: each pair counts +1 (we push two pipes per pair)
    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5;
      pipe.passed = true;
    }

    if (detectCollision(bird, pipe)) {
      endGame();
      return;
    }
  }

  // Clean pipes that are off-screen (memory)
  pipeArray = pipeArray.filter(p => p.x + p.width > -20);

  // Score text
  context.fillStyle = "white";
  context.font = "45px sans-serif";
  context.fillText(Math.floor(score), 5, 45);
}

// ---------- Pipes spawn ----------
function scheduleNextPipe() {
  if (gameOver) return;

  const randomDelay = 3500 + Math.random() * 2500; // 3.5 – 6s
  spawnTimeoutId = setTimeout(() => {
    placePipes();
    scheduleNextPipe();
  }, randomDelay);
}

function placePipes() {
  if (gameOver) return;

  // Easier gap & safe vertical zone
  const spacebetween = 180 + Math.random() * 70; // 180–250
  const minGapY = 200;
  const maxGapY = boardheight - 200;
  const gapY = minGapY + Math.random() * (maxGapY - minGapY);

  const topPipe = {
    img: toppipeimg,
    x: pipeX,
    y: gapY - pipeheight,
    width: pipewidth,
    height: pipeheight,
    passed: false,
  };
  const bottomPipe = {
    img: bottompipeimg,
    x: pipeX,
    y: gapY + spacebetween,
    width: pipewidth,
    height: pipeheight,
    passed: false,
  };

  pipeArray.push(topPipe, bottomPipe);
}

// ---------- Utils ----------
function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
