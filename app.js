let board;
let boardwidth = 360;
let boardheight = 640;
let context;

let birdwidth = 34;
let birdheight = 24;
let birdimage;
let gameOver = false;
let score = 0;
//Need 4 parameters to specify the bird on the page 
let birdX = boardwidth/8;
let birdY = boardheight/2;

//Drawing our bird object
let bird = {
    x:birdX,
    y:birdY,
    width:birdwidth,
    height:birdheight
}

//pipes

let pipeArray = [];
let pipewidth = 64;
let pipeheight = 512;
//Here these are the x and y coordinates of my pipe 
let pipeX = boardwidth;
let pipeY = 0;
let toppipeimg;
let bottompipeimg;
let gameoverimg;

//physics
let velocityX = -2; // pipes moving left 
let velocityY = 0; //bird speed there will be a change in the y position
let gravity = 0.4; // this brings it down

window.onload=function(){
    board = document.getElementById("board");
    board.height = boardheight;
    board.width = boardwidth;
    context = board.getContext("2d"); // for drawing on the board do changes here

    //context.fillstyle = "green";
    //context.fillRect(bird.x,bird.y,birdwidth,birdheight);

    //loading the birdimage
    //classic example of how to draw an image using canvas
    birdimage = new Image();
    birdimage.src = "./flpy.png";
    birdimage.onload=function(){
        context.drawImage(birdimage,bird.x,bird.y,bird.width,bird.height);

    }
    toppipeimg = new Image();
    bottompipeimg = new Image();
    gameoverimg = new Image();
    toppipeimg.src = "./toppipe.png";
    bottompipeimg.src = "./bottompipe.png";
    gameoverimg.src = "./gameover.png";
    gameoverimg.onload = function(){
        console.log("Game over image loaded successfully");
    };
    requestAnimationFrame(update);
    // Random spacing between pipe pairs for more variety
    scheduleNextPipe();
    document.addEventListener("keydown",movebird);    
    

}

function update(){
    requestAnimationFrame(update);
    //we want to clear everything on the canvas 
    context.clearRect(0,0,board.width,board.height);
    
    if(gameOver){
        // Display game over image when game ends
        context.drawImage(gameoverimg, boardwidth/2 - 100, boardheight/2 - 50, 200, 100);
        
        // Display final score on game over screen
        context.fillStyle = "white";
        context.font = "36px Arial";
        context.textAlign = "center";
        context.fillText("Final Score: " + Math.floor(score), boardwidth/2, boardheight/2 + 80);
        return;
    }
    velocityY+=gravity
    bird.y = Math.max(bird.y+velocityY,0);
    context.drawImage(birdimage,bird.x,bird.y,bird.width,bird.height);
    
    if(bird.y>board.height){
        gameOver = true;
    }
    //pipes
    for(let i =0;i<pipeArray.length;i++){
        let pipe = pipeArray[i];
        pipe.x +=velocityX;
        context.drawImage(pipe.img,pipe.x,pipe.y,pipe.width,pipe.height);
        if(!pipe.passed && bird.x> pipe.x+ pipe.width){
            score+=0.5;
            pipe.passed=true;

        }
        if(detectcollision(bird,pipe)){
            gameOver = true;
        }
    }


    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score,5,45);

}
function scheduleNextPipe(){
    if(gameOver){
        return;
    }
    // Random timing between 3.5 to 6 seconds for much larger, varied spacing
    let randomDelay = 3500 + Math.random() * 2500; // 3.5-6 seconds
    setTimeout(() => {
        placepipes();
        scheduleNextPipe(); // Schedule the next pipe
    }, randomDelay);
}

function placepipes(){
    if(gameOver){
        return;
    }
    // Random gap size between 180-250px for much easier gameplay
    let spacebetween = 180 + Math.random() * 70; // 180-250px gap
    
    // Ensure gap is always reachable - position gap center in safe zone
    // Leave enough space above and below for the gap to be navigable
    let minGapY = 200; // Minimum distance from top
    let maxGapY = boardheight - 200; // Minimum distance from bottom
    let gapY = minGapY + Math.random() * (maxGapY - minGapY);
    let toppipe = {
        img: toppipeimg,
        x: pipeX,
        y: gapY - pipeheight, // Top pipe extends upward from gap
        width:pipewidth,
        height:pipeheight,
        passed:false
    }
    let bottompipe={
        img:bottompipeimg,
        x:pipeX,
        y: gapY + spacebetween, // Bottom pipe starts below the gap
        width:pipewidth,
        height:pipeheight,
        passed:false

    }
    pipeArray.push(toppipe);
    pipeArray.push(bottompipe);
}

//This is a function movebird and it takes a parameter key
function movebird(e){
    if(e.code=="Space" || e.code=="ArrowUp"){
        velocityY = -6;
    }

}
function detectcollision(a,b){
    return a.x<b.x+b.width && a.x+a.width>b.x && a.y<b.y+b.height && a.y+a.height>b.y;

}
function saveHighScore(score){
  const prev = Number(localStorage.getItem('flpy_highscore') || 0);
  if (score > prev) localStorage.setItem('flpy_highscore', String(score));
}

function onGameOver(finalScore){
  saveHighScore(finalScore);
  // redirige vers la page de fin avec le score
  window.location.href = 'gameover.html?score=' + encodeURIComponent(finalScore);
}
