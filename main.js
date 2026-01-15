// Game loader and shared loop
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');

let currentGame = null;
let lastTime = 0;
let running = false;

function resizeCanvas(){
  // keep internal resolution fixed for simplicity; CSS scales canvas
  // optional: adapt to window size
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function startLoop(){
  if(running) return;
  running = true;
  lastTime = performance.now();
  requestAnimationFrame(loop);
}
function stopLoop(){
  running = false;
}
function loop(t){
  if(!running) return;
  const dt = (t - lastTime) / 1000;
  lastTime = t;
  if(currentGame){
    currentGame.update(dt);
    currentGame.draw(ctx);
    updateHUD();
  } else {
    // clear
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  requestAnimationFrame(loop);
}

function updateHUD(){
  scoreEl.textContent = 'Score: ' + (currentGame?.score ?? 0);
  livesEl.textContent = 'Leben: ' + (currentGame?.lives ?? 0);
}

function loadGame(name){
  if(currentGame && currentGame.stop) currentGame.stop();
  // choose game
  if(name === 'shooter'){
    currentGame = new ShooterGame(canvas.width, canvas.height);
    document.getElementById('controls-shooter').style.display = '';
    document.getElementById('controls-racing').style.display = 'none';
    infoEl.textContent = 'Shooter geladen: Bewege mit A/D oder Pfeile, Leertaste = Schießen';
  } else if(name === 'racing'){
    currentGame = new RacingGame(canvas.width, canvas.height);
    document.getElementById('controls-shooter').style.display = 'none';
    document.getElementById('controls-racing').style.display = '';
    infoEl.textContent = 'Rennen geladen: Bewege mit A/D oder Pfeile um Hindernissen auszuweichen';
  } else {
    currentGame = null;
    infoEl.textContent = 'Wähle ein Spiel.';
  }
  if(currentGame && currentGame.start) currentGame.start();
  startLoop();
}

document.getElementById('btn-shooter').addEventListener('click', ()=> loadGame('shooter'));
document.getElementById('btn-racing').addEventListener('click', ()=> loadGame('racing'));
document.getElementById('btn-reset').addEventListener('click', ()=> {
  loadGame(null);
  scoreEl.textContent = 'Score: 0';
  livesEl.textContent = 'Leben: 0';
  document.getElementById('controls-shooter').style.display = 'none';
  document.getElementById('controls-racing').style.display = 'none';
});

// Global keyboard forwarding
const keys = {};
window.addEventListener('keydown', (e)=>{
  if(!keys[e.code]){
    keys[e.code] = true;
    currentGame?.onKeyDown?.(e.code);
  }
});
window.addEventListener('keyup', (e)=>{
  keys[e.code] = false;
  currentGame?.onKeyUp?.(e.code);
});
