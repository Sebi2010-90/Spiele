// Simple top-down shooter
class ShooterGame {
  constructor(w,h){
    this.w = w; this.h = h;
    this.player = {x: w/2, y: h-50, w:28, h:18, speed: 260};
    this.bullets = [];
    this.enemies = [];
    this.enemyTimer = 0;
    this.score = 0;
    this.lives = 3;
    this.keys = {};
    this.shootCooldown = 0;
    this.running = false;
  }

  start(){
    this.running = true;
    this.score = 0;
    this.lives = 3;
    this.bullets = [];
    this.enemies = [];
    this.enemyTimer = 0;
  }
  stop(){
    this.running = false;
  }

  onKeyDown(code){
    this.keys[code] = true;
  }
  onKeyUp(code){
    this.keys[code] = false;
  }

  update(dt){
    if(!this.running) return;
    // player movement
    let dir = 0;
    if(this.keys['ArrowLeft'] || this.keys['KeyA']) dir -= 1;
    if(this.keys['ArrowRight'] || this.keys['KeyD']) dir += 1;
    this.player.x += dir * this.player.speed * dt;
    this.player.x = Math.max(16, Math.min(this.w - 16, this.player.x));

    // shooting
    this.shootCooldown -= dt;
    if((this.keys['Space'] || this.keys['KeyW'] || this.keys['ArrowUp']) && this.shootCooldown <= 0){
      this.bullets.push({x: this.player.x, y: this.player.y - 12, vy: -520});
      this.shootCooldown = 0.2;
    }

    // bullets
    for(let i=this.bullets.length-1;i>=0;i--){
      const b = this.bullets[i];
      b.y += b.vy * dt;
      if(b.y < -10) this.bullets.splice(i,1);
    }

    // spawn enemies
    this.enemyTimer -= dt;
    if(this.enemyTimer <= 0){
      this.enemyTimer = 0.6 + Math.random()*0.6;
      const ex = 20 + Math.random()*(this.w-40);
      const speed = 50 + Math.random()*120;
      this.enemies.push({x:ex,y:-20,vy:speed,w:26,h:18,hp:1});
    }

    // enemies update
    for(let i=this.enemies.length-1;i>=0;i--){
      const e = this.enemies[i];
      e.y += e.vy * dt;
      if(e.y > this.h + 40){
        this.enemies.splice(i,1);
        this.lives -= 1;
        if(this.lives <= 0) this.gameOver();
      }
    }

    // collisions bullets <-> enemies
    for(let i=this.enemies.length-1;i>=0;i--){
      const e = this.enemies[i];
      for(let j=this.bullets.length-1;j>=0;j--){
        const b = this.bullets[j];
        if(Math.abs(b.x - e.x) < 18 && Math.abs(b.y - e.y) < 14){
          // hit
          this.enemies.splice(i,1);
          this.bullets.splice(j,1);
          this.score += 10;
          break;
        }
      }
    }

    // collision enemy <-> player
    for(let i=this.enemies.length-1;i>=0;i--){
      const e = this.enemies[i];
      if(Math.abs(e.x - this.player.x) < 22 && Math.abs(e.y - this.player.y) < 18){
        this.enemies.splice(i,1);
        this.lives -= 1;
        if(this.lives <= 0) this.gameOver();
      }
    }
  }

  draw(ctx){
    ctx.clearRect(0,0,this.w,this.h);
    // background stars
    ctx.fillStyle = '#041220';
    ctx.fillRect(0,0,this.w,this.h);

    // player
    ctx.save();
    ctx.translate(this.player.x, this.player.y);
    ctx.fillStyle = '#33d6ff';
    ctx.beginPath();
    ctx.moveTo(0,-14);
    ctx.lineTo(12,10);
    ctx.lineTo(-12,10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // bullets
    ctx.fillStyle = '#fffc9e';
    for(const b of this.bullets){
      ctx.fillRect(b.x-2,b.y-8,4,10);
    }

    // enemies
    for(const e of this.enemies){
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(e.x - e.w/2, e.y - e.h/2, e.w, e.h);
      // eyes
      ctx.fillStyle = '#2a1212';
      ctx.fillRect(e.x-6, e.y-2, 4, 4);
      ctx.fillRect(e.x+2, e.y-2, 4, 4);
    }

    // HUD inside canvas
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(8,8,120,36);
    ctx.fillStyle = '#cde9ff';
    ctx.font = '14px Arial';
    ctx.fillText('Score: ' + this.score, 16, 28);
  }

  gameOver(){
    this.running = false;
    // show game over text
    setTimeout(()=> {
      alert('Game Over! Score: ' + this.score);
      // restart
      this.start();
    }, 20);
  }
}
