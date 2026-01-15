// Simple top-down racing / avoider
class RacingGame {
  constructor(w,h){
    this.w = w; this.h = h;
    this.player = {x: w/2, y: h - 80, w:28, h:40, speed: 260};
    this.obstacles = [];
    this.obsTimer = 0;
    this.score = 0;
    this.lives = 3;
    this.keys = {};
    this.running = false;
    this.roadX = w/2;
    this.roadW = Math.min(420, w-200);
    this.speedFactor = 220; // obstacle speed base
  }

  start(){
    this.running = true;
    this.score = 0;
    this.lives = 3;
    this.obstacles = [];
    this.obsTimer = 0.6;
  }
  stop(){
    this.running = false;
  }

  onKeyDown(code){ this.keys[code] = true; }
  onKeyUp(code){ this.keys[code] = false; }

  update(dt){
    if(!this.running) return;
    // move player
    let dir = 0;
    if(this.keys['ArrowLeft'] || this.keys['KeyA']) dir -= 1;
    if(this.keys['ArrowRight'] || this.keys['KeyD']) dir += 1;
    this.player.x += dir * this.player.speed * dt;
    const leftBound = this.w/2 - this.roadW/2 + 18;
    const rightBound = this.w/2 + this.roadW/2 - 18;
    this.player.x = Math.max(leftBound, Math.min(rightBound, this.player.x));

    // spawn obstacles
    this.obsTimer -= dt;
    if(this.obsTimer <= 0){
      this.obsTimer = 0.8 + Math.random()*0.6;
      const laneX = this.w/2 - this.roadW/2 + 40 + Math.random()*(this.roadW - 80);
      const sizeW = 26 + Math.random()*36;
      const speed = this.speedFactor + Math.random()*120 + this.score*0.5;
      this.obstacles.push({x: laneX, y:-40, w:sizeW, h:30, vy: speed});
    }

    // update obstacles
    for(let i=this.obstacles.length-1;i>=0;i--){
      const o = this.obstacles[i];
      o.y += o.vy * dt;
      if(o.y > this.h + 60) {
        this.obstacles.splice(i,1);
        this.score += 5;
      }
    }

    // collisions
    for(let i=this.obstacles.length-1;i>=0;i--){
      const o = this.obstacles[i];
      if(Math.abs(o.x - this.player.x) < (o.w+this.player.w)/2 && Math.abs(o.y - this.player.y) < (o.h+this.player.h)/2){
        this.obstacles.splice(i,1);
        this.lives -= 1;
        if(this.lives <= 0) this.gameOver();
      }
    }
  }

  draw(ctx){
    ctx.clearRect(0,0,this.w,this.h);
    // road
    ctx.fillStyle = '#02222d';
    ctx.fillRect(0,0,this.w,this.h);
    const rx = this.w/2 - this.roadW/2;
    ctx.fillStyle = '#2b3b44';
    ctx.fillRect(rx, 0, this.roadW, this.h);

    // lane markers
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 6;
    ctx.setLineDash([18,18]);
    ctx.beginPath();
    ctx.moveTo(this.w/2, 0);
    ctx.lineTo(this.w/2, this.h);
    ctx.stroke();
    ctx.setLineDash([]);

    // player car
    ctx.save();
    ctx.translate(this.player.x, this.player.y);
    ctx.fillStyle = '#7affc7';
    ctx.fillRect(-this.player.w/2, -this.player.h/2, this.player.w, this.player.h);
    ctx.fillStyle = '#073b2f';
    ctx.fillRect(-this.player.w/2+4, -this.player.h/2+6, this.player.w-8, this.player.h-12);
    ctx.restore();

    // obstacles
    for(const o of this.obstacles){
      ctx.fillStyle = '#ff8a65';
      ctx.fillRect(o.x - o.w/2, o.y - o.h/2, o.w, o.h);
    }

    // HUD small
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(8,8,140,40);
    ctx.fillStyle = '#cde9ff';
    ctx.font = '14px Arial';
    ctx.fillText('Score: ' + this.score, 16, 28);
  }

  gameOver(){
    this.running = false;
    setTimeout(()=> {
      alert('Race Over! Score: ' + this.score);
      this.start();
    }, 20);
  }
}
