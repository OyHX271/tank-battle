// 游戏实体：子弹、坦克、道具

// ==================== 子弹 ====================
class Bullet {
  constructor(x, y, dir, speed, ownerType) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.speed = speed;
    this.ownerType = ownerType; // 'player' 或 'enemy'
    this.active = true;
    this.size = BULLET_SIZE;
  }

  update() {
    switch (this.dir) {
      case DIR.UP:    this.y -= this.speed; break;
      case DIR.DOWN:  this.y += this.speed; break;
      case DIR.LEFT:  this.x -= this.speed; break;
      case DIR.RIGHT: this.x += this.speed; break;
    }
  }

  render(ctx) {
    const color = this.ownerType === 'player' ? COLORS.BULLET_PLAYER : COLORS.BULLET_ENEMY;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;
    ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    ctx.shadowBlur = 0;
  }

  // 子弹是否在画布内
  isInBounds() {
    return this.x >= 0 && this.x <= CANVAS.WIDTH &&
           this.y >= 0 && this.y <= CANVAS.HEIGHT;
  }
}

// ==================== 坦克基类 ====================
class Tank {
  constructor(x, y, dir, type) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.type = type;
    this.speed = TANK_SPEED[type] || 2;
    this.maxHealth = TANK_HEALTH[type] || 1;
    this.health = this.maxHealth;
    this.alive = true;
    this.size = TANK_SIZE;
    this.bullets = [];
    this.shootCooldown = 0;
    this.shootDelay = type === 'player' ? 25 : 60; // 帧
    this.moving = false;
    this.moveCooldown = 0;
    this.flashTimer = 0; // 受伤闪烁
  }

  getBounds() {
    return {
      left: this.x - this.size/2,
      top: this.y - this.size/2,
      right: this.x + this.size/2,
      bottom: this.y + this.size/2
    };
  }

  collidesWith(other) {
    const a = this.getBounds();
    const b = other.getBounds();
    return !(a.right < b.left || a.left > b.right ||
             a.bottom < b.top || a.top > b.bottom);
  }

  // 检查在(x,y)是否会与别的坦克碰撞
  collidesWithTanks(x, y, otherTanks) {
    const half = this.size / 2;
    for (const other of otherTanks) {
      if (other === this || !other.alive) continue;
      const oh = other.size / 2;
      if (!(x + half <= other.x - oh || x - half >= other.x + oh ||
            y + half <= other.y - oh || y - half >= other.y + oh)) {
        return true;
      }
    }
    return false;
  }

  takeDamage() {
    this.health--;
    this.flashTimer = 8;
    if (this.health <= 0) {
      this.alive = false;
    }
  }

  shoot(bulletOwnerType) {
    if (this.shootCooldown > 0 || !this.alive) return null;

    // 限制同屏子弹数
    const activeBullets = this.bullets.filter(b => b.active);
    if (activeBullets.length >= (this.type === 'player' ? 2 : 1)) return null;

    let bx = this.x, by = this.y;
    const offset = this.size / 2 + 2;
    switch (this.dir) {
      case DIR.UP:    by -= offset; break;
      case DIR.DOWN:  by += offset; break;
      case DIR.LEFT:  bx -= offset; break;
      case DIR.RIGHT: bx += offset; break;
    }

    const speed = bulletOwnerType === 'player' ? BULLET_SPEED.player : BULLET_SPEED.enemy;
    const bullet = new Bullet(bx, by, this.dir, speed, bulletOwnerType);
    this.bullets.push(bullet);
    this.shootCooldown = this.shootDelay;
    return bullet;
  }

  updateCooldown() {
    if (this.shootCooldown > 0) this.shootCooldown--;
    if (this.moveCooldown > 0) this.moveCooldown--;
    if (this.flashTimer > 0) this.flashTimer--;
    this.bullets = this.bullets.filter(b => b.active);
  }

  render(ctx) {
    if (!this.alive) return;
    // 受伤闪烁
    if (this.flashTimer > 0 && this.flashTimer % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.dir * Math.PI / 2);

    const color = this._getColor();
    const darkColor = this._getDarkColor();

    // 履带
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-14, -12, 5, 24);
    ctx.fillRect(9, -12, 5, 24);

    // 履带纹理
    ctx.fillStyle = '#475569';
    for (let i = -10; i <= 10; i += 6) {
      ctx.fillRect(-14, i, 5, 2);
      ctx.fillRect(9, i, 5, 2);
    }

    // 车身
    ctx.fillStyle = color;
    const r = 3;
    ctx.beginPath();
    ctx.moveTo(-10 + r, -10);
    ctx.lineTo(10 - r, -10);
    ctx.arcTo(10, -10, 10, -10 + r, r);
    ctx.lineTo(10, 10 - r);
    ctx.arcTo(10, 10, 10 - r, 10, r);
    ctx.lineTo(-10 + r, 10);
    ctx.arcTo(-10, 10, -10, 10 - r, r);
    ctx.lineTo(-10, -10 + r);
    ctx.arcTo(-10, -10, -10 + r, -10, r);
    ctx.closePath();
    ctx.fill();

    // 车身装饰线
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    // 炮塔座
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    // 炮管
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-2.5, -15, 5, 10);

    // 炮管尖端
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-1.5, -16, 3, 4);

    ctx.restore();

    // 血条（仅敌人多血时显示）
    if (this.type !== 'player' && this.maxHealth > 1 && this.health < this.maxHealth) {
      const barW = 24;
      const barH = 3;
      const bx = this.x - barW/2;
      const by = this.y - this.size/2 - 6;
      ctx.fillStyle = '#333';
      ctx.fillRect(bx, by, barW, barH);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(bx, by, barW * (this.health / this.maxHealth), barH);
    }
  }

  _getColor() {
    const colorMap = {
      player: COLORS.PLAYER,
      basic: COLORS.ENEMY_BASIC,
      fast: COLORS.ENEMY_FAST,
      power: COLORS.ENEMY_POWER,
      armor: COLORS.ENEMY_ARMOR
    };
    return colorMap[this.type] || '#fff';
  }

  _getDarkColor() {
    const colorMap = {
      player: COLORS.PLAYER_DARK,
      basic: '#64748b',
      fast: '#3b82f6',
      power: '#d97706',
      armor: '#22c55e'
    };
    return colorMap[this.type] || '#999';
  }
}

// ==================== 玩家坦克 ====================
class PlayerTank extends Tank {
  constructor(x, y) {
    super(x, y, DIR.UP, 'player');
    this.lives = PLAYER_START_LIVES;
    this.powerLevel = 1; // 1-3
    this.invincible = false;
    this.invincibleTimer = 0;
    this.shootDelay = 20;
  }

  update(map, otherTanks) {
    if (!this.alive) return;
    this.updateCooldown();

    if (this.invincibleTimer > 0) {
      this.invincibleTimer--;
      if (this.invincibleTimer <= 0) this.invincible = false;
    }

    // 移动
    let newDir = this.dir;
    let moving = false;

    if (KeyInput.up)    { newDir = DIR.UP;    moving = true; }
    if (KeyInput.down)  { newDir = DIR.DOWN;  moving = true; }
    if (KeyInput.left)  { newDir = DIR.LEFT;  moving = true; }
    if (KeyInput.right) { newDir = DIR.RIGHT; moving = true; }

    if (moving) {
      // 转向时对齐到网格，方便通过狭窄通道
      if (newDir !== this.dir) {
        const half = this.size / 2;
        const minX = GRID_OFFSET.X + half;
        const maxX = GRID_OFFSET.X + GRID_COLS * TILE_SIZE - half;
        const minY = GRID_OFFSET.Y + half;
        const maxY = GRID_OFFSET.Y + GRID_ROWS * TILE_SIZE - half;

        let snapX = GRID_OFFSET.X + Math.round((this.x - GRID_OFFSET.X) / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
        let snapY = GRID_OFFSET.Y + Math.round((this.y - GRID_OFFSET.Y) / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
        snapX = Math.max(minX, Math.min(maxX, snapX));
        snapY = Math.max(minY, Math.min(maxY, snapY));

        // 沿垂直于新方向的方向对齐，且确保不穿墙
        if (newDir === DIR.UP || newDir === DIR.DOWN) {
          if (!map.collidesWithWall(snapX - half, this.y - half, snapX + half, this.y + half)) {
            this.x = snapX;
          }
        } else {
          if (!map.collidesWithWall(this.x - half, snapY - half, this.x + half, snapY + half)) {
            this.y = snapY;
          }
        }
      }

      this.dir = newDir;
      const half = this.size / 2;

      // 分轴检测X：墙壁 + 边界 + 其他坦克
      const dx = this.dir === DIR.RIGHT ? this.speed : this.dir === DIR.LEFT ? -this.speed : 0;
      let testX = this.x + dx;
      if (!map.collidesWithWall(testX - half, this.y - half, testX + half, this.y + half) &&
          testX - half >= GRID_OFFSET.X && testX + half <= GRID_OFFSET.X + GRID_COLS * TILE_SIZE &&
          !this.collidesWithTanks(testX, this.y, otherTanks)) {
        this.x = testX;
      }

      // 分轴检测Y：墙壁 + 边界 + 其他坦克
      const dy = this.dir === DIR.DOWN ? this.speed : this.dir === DIR.UP ? -this.speed : 0;
      let testY = this.y + dy;
      if (!map.collidesWithWall(this.x - half, testY - half, this.x + half, testY + half) &&
          testY - half >= GRID_OFFSET.Y && testY + half <= GRID_OFFSET.Y + GRID_ROWS * TILE_SIZE &&
          !this.collidesWithTanks(this.x, testY, otherTanks)) {
        this.y = testY;
      }

      this.moving = true;
    } else {
      this.moving = false;
    }

    // 无敌闪烁
    if (this.invincible && this.invincibleTimer % 6 < 3) {
      // 闪烁效果通过透明度实现，在render中处理
    }
  }

  render(ctx) {
    if (!this.alive) return;

    // 无敌闪烁
    if (this.invincible && Math.floor(this.invincibleTimer / 4) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    super.render(ctx);
    ctx.globalAlpha = 1;

    // 无敌护盾光环
    if (this.invincible) {
      ctx.save();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size / 2 + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.dir = DIR.UP;
    this.alive = true;
    this.health = this.maxHealth;
    this.bullets = [];
    this.shootCooldown = 0;
    this.powerLevel = 1;
    if (this.lives <= 0) this.lives = PLAYER_START_LIVES;
  }

  loseLife() {
    this.lives--;
    this.alive = false;
    return this.lives > 0;
  }

  upgrade() {
    if (this.powerLevel < 3) {
      this.powerLevel++;
      this.shootDelay = Math.max(10, this.shootDelay - 5);
    }
  }
}

// ==================== 敌人坦克 ====================
class EnemyTank extends Tank {
  constructor(x, y, enemyType, map) {
    super(x, y, DIR.DOWN, enemyType);
    this.map = map;
    this.aiTimer = 0;
    this.aiChangeInterval = this._getAIInterval();
    this.preferPlayerDir = Math.random() < 0.4; // 40%几率倾向玩家
  }

  _getAIInterval() {
    switch (this.type) {
      case 'fast': return 30 + Math.floor(Math.random() * 30);
      case 'power': return 25 + Math.floor(Math.random() * 25);
      default: return 40 + Math.floor(Math.random() * 60);
    }
  }

  update(playerX, playerY, allTanks) {
    if (!this.alive) return;
    this.updateCooldown();

    this.aiTimer++;

    // 尝试向玩家移动
    if (this.preferPlayerDir && this.aiTimer % 20 === 0) {
      const dx = playerX - this.x;
      const dy = playerY - this.y;
      if (Math.abs(dx) > Math.abs(dy)) {
        this.dir = dx > 0 ? DIR.RIGHT : DIR.LEFT;
      } else {
        this.dir = dy > 0 ? DIR.DOWN : DIR.UP;
      }
    }

    // 定期随机换方向
    if (this.aiTimer >= this.aiChangeInterval) {
      this.aiTimer = 0;
      this.aiChangeInterval = this._getAIInterval();
      this.dir = Math.floor(Math.random() * 4);
    }

    // 分轴移动：墙壁 + 边界 + 其他坦克
    const half = this.size / 2;
    let moved = false;

    const dx = this.dir === DIR.RIGHT ? this.speed : this.dir === DIR.LEFT ? -this.speed : 0;
    let testX = this.x + dx;
    if (!this.map.collidesWithWall(testX - half, this.y - half, testX + half, this.y + half) &&
        testX - half >= GRID_OFFSET.X && testX + half <= GRID_OFFSET.X + GRID_COLS * TILE_SIZE &&
        !this.collidesWithTanks(testX, this.y, allTanks)) {
      this.x = testX;
      moved = true;
    }

    const dy = this.dir === DIR.DOWN ? this.speed : this.dir === DIR.UP ? -this.speed : 0;
    let testY = this.y + dy;
    if (!this.map.collidesWithWall(this.x - half, testY - half, this.x + half, testY + half) &&
        testY - half >= GRID_OFFSET.Y && testY + half <= GRID_OFFSET.Y + GRID_ROWS * TILE_SIZE &&
        !this.collidesWithTanks(this.x, testY, allTanks)) {
      this.y = testY;
      moved = true;
    }

    if (!moved) {
      this.dir = Math.floor(Math.random() * 4);
      this.aiTimer = 0;
    } else {
      this.moving = true;
    }

  }

  getScore() {
    switch (this.type) {
      case 'fast': return 200;
      case 'power': return 300;
      case 'armor': return 400;
      default: return 100;
    }
  }
}

// ==================== 道具 ====================
class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.active = true;
    this.lifetime = 600; // 10秒 (60fps * 10)
    this.size = 24;
    this.bobOffset = 0;
  }

  update() {
    this.lifetime--;
    this.bobOffset = Math.sin(this.lifetime * 0.1) * 3;
    if (this.lifetime <= 0) {
      this.active = false;
    }
  }

  render(ctx) {
    if (!this.active) return;

    const y = this.y + this.bobOffset;
    const colors = {
      star: COLORS.POWERUP_STAR,
      tank: COLORS.POWERUP_TANK,
      clock: COLORS.POWERUP_CLOCK,
      shield: COLORS.POWERUP_SHIELD,
      bomb: COLORS.POWERUP_BOMB
    };
    const color = colors[this.type] || '#fff';

    // 背景圆
    ctx.fillStyle = '#1a1a2e';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, y, this.size / 2 + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 内部图案
    ctx.fillStyle = color;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const icons = {
      star: '★',
      tank: '♥',
      clock: '⏸',
      shield: '●',
      bomb: '✱'
    };
    ctx.fillText(icons[this.type] || '?', this.x, y);

    // 闪烁提示快过期
    if (this.lifetime < 120 && Math.floor(this.lifetime / 15) % 2 === 0) {
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(this.x, y, this.size / 2 + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}
