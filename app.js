let board;
let boardwidth = 360;
let boardheight = 640;
let context;

let birdwidth = 34;
let birdheight = 24;
let birdimage;
let gameOver = false;
let hasEnded = false;         // ✅ pour éviter plusieurs déclenchements
let score = 0;

let birdX = boardwidth/8;
let birdY = boardheight/2;

let bird = { x: birdX, y: birdY, width: birdwidth, height: birdheight };

// pipes
let pipeArray = [];
let pipewidth = 64;
let pipeheight = 512;
let pipeX = boardwidth;
let pipeY = 0;
let toppipeimg;
let bottompipeimg;
let gameoverimg;

// physics
let velocityX = -2; // pipes moving left
let velocityY = 0;  // bird speed
let gravity = 0.4;  // pulls down

window.onload = function(){
  board = document.getElementById("board");
  board.height = boardheight;
  board.width = boardwidth;
  context = board.getContext("2d");

  birdimage = new Image();
  birdimage.src = "./flpy.png";
  birdimage.onload = function(){
    context.drawImage(birdimage, bird.x, bird.y, bird.width, bird.height);
  }

  toppipeimg = new Image();
  bottompipeimg = new Image();
  gameoverimg = new Image();
  toppipeimg.src = "./toppipe.png";
  bottompipeimg.src = "./bottompipe.png";
  gameoverimg.src = "./gameover.png";

  requestAnimationFrame(update);
  scheduleNextPipe();
  document.addEventListener("keydown", movebird);
};

// ✅ fonctions score & fin de partie
function saveHighScore(score){
  const prev = Number(localStorage.getItem('flpy_highscore') || 0);
  if (score > prev) localStorage.setItem('flpy_highscore', String(score));
}

function onGameOver(finalScore){
  saveHighScore(finalScore);
  window.location.href = 'gameover.html?score=' + encodeURIComponent(finalScore);
}

function endGame(){
  if (hasEnded) return;               // éviter double appel
  hasEnded = true;
  const finalScore = Math.floor(score);
  onGameOver(finalScore);             // redirection vers page de fin
}

function update(){
  requestAnimationFrame(update);
  context.clearRect(0,0,board.width,board.height);

  if (gameOver) {
    return; // on arrête le rendu; endGame() gère la redirection
  }

  // gravité / mouvement oiseau
  velocityY += gravity;
  bird.y = Math.max(bird.y + velocityY, 0);
  context.drawImage(birdimage, bird.x, bird.y, bird.width, bird.height);

  // sortie écran bas -> fin
  if (bird.y > board.height) {
    gameOver = true;
    endGame();                        // ✅ déclenche fin
  }

  // pipes
  for (let i=0; i<pipeArray.length; i++){
    let pipe = pipeArray[i];
    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width){
      score += 0.5;                   // deux tuyaux / paire -> +1 au total
      pipe.passed = true;
    }
    if (detectcollision(bird, pipe)){
      gameOver = true;
      endGame();                      // ✅ déclenche fin
    }
  }

  // score
  context.fillStyle = "white";
  context.font = "45px sans-serif";
  context.fillText(Math.floor(score), 5, 45);
}

function scheduleNextPipe(){
  if (gameOver) return;
  const randomDelay = 3500 + Math.random() * 2500; // 3.5–6s
  setTimeout(() => {
    placepipes();
    scheduleNextPipe();
  }, randomDelay);
}

function placepipes(){
  if (gameOver) return;

  const spacebetween = 180 + Math.random() * 70; // 180–250
  const minGapY = 200;
  const maxGapY = boardheight - 200;
  const gapY = minGapY + Math.random() * (maxGapY - minGapY);

  const toppipe = {
    img: toppipeimg, x: pipeX, y: gapY - pipeheight,
    width: pipewidth, height: pipeheight, passed: false
  };
  const bottompipe = {
    img: bottompipeimg, x: pipeX, y: gapY + spacebetween,
    width: pipewidth, height: pipeheight, passed: false
  };
  pipeArray.push(toppipe, bottompipe);
}

function movebird(e){
  if (e.code == "Space" || e.code == "ArrowUp"){
    velocityY = -6;
  }
}

function detectcollision(a, b){
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}
