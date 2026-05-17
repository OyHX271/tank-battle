// 音效系统
const Sound = {
  _ctx: null,

  _ensureCtx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._ctx;
  },

  play(type) {
    try {
      const ctx = this._ensureCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      switch (type) {
        case 'shoot':
          osc.type = 'square';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.08);
          break;

        case 'hit':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.15);
          break;

        case 'explosion':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(80, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.3);
          break;

        case 'powerup':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.2);
          break;

        case 'gameover':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.8);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.8);
          break;

        case 'levelup':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, ctx.currentTime);
          osc.frequency.setValueAtTime(400, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(500, ctx.currentTime + 0.2);
          osc.frequency.setValueAtTime(600, ctx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.5);
          break;
      }
    } catch (e) {
      // 静默处理音频错误
    }
  }
};

// ==================== 主游戏类 ====================
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = CANVAS.WIDTH;
    this.canvas.height = CANVAS.HEIGHT;

    this.state = GAME_STATE.MENU;
    this.level = 0;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('tankBattleHighScore') || '0');

    this.map = null;
    this.player = null;
    this.enemies = [];
    this.powerUps = [];
    this.allBullets = [];

    this.enemySpawnQueue = [];
    this.enemySpawnTimer = 0;
    this.enemiesKilled = 0;
    this.totalEnemies = ENEMIES_PER_LEVEL;

    this.playerSpawnPos = { col: 8, row: 12 };
    this.enemySpawnPoints = [
      { col: 0, row: 0 },
      { col: 6, row: 0 },
      { col: 12, row: 0 }
    ];

    this.shakeTimer = 0;
    this.shakeIntensity = 0;

    this.messageText = '';
    this.messageTimer = 0;

    this.frameCount = 0;
  }

  // 网格坐标 → 画布中心坐标
  gridToCanvas(col, row) {
    return {
      x: GRID_OFFSET.X + col * TILE_SIZE + TILE_SIZE / 2,
      y: GRID_OFFSET.Y + row * TILE_SIZE + TILE_SIZE / 2
    };
  }

  init() {
    KeyInput.init();

    // 点击开始
    this.canvas.addEventListener('click', () => {
      if (this.state === GAME_STATE.MENU) {
        this.startGame();
      } else if (this.state === GAME_STATE.GAME_OVER) {
        this.startGame();
      }
    });
  }

  startGame() {
    this.level = 0;
    this.score = 0;
    this.state = GAME_STATE.PLAYING;
    this.loadLevel();
  }

  loadLevel() {
    this.map = new Map(this.level);
    this.enemies = [];
    this.powerUps = [];
    this.allBullets = [];
    this.enemiesKilled = 0;
    this.totalEnemies = ENEMIES_PER_LEVEL + this.level * 2;
    this.enemySpawnTimer = 60; // 1秒后开始出敌人
    this.enemySpawnQueue = this._generateEnemyQueue();
    this.shakeTimer = 0;
    this.messageText = '';
    this.messageTimer = 0;

    // 创建/重置玩家
    const playerPos = this.gridToCanvas(this.playerSpawnPos.col, this.playerSpawnPos.row);
    if (this.player) {
      this.player.reset(playerPos.x, playerPos.y);
      this.player.lives = this.player.lives || PLAYER_START_LIVES;
    } else {
      this.player = new PlayerTank(playerPos.x, playerPos.y);
    }

    // 保护基地
    this.map.protectBase();
  }

  _generateEnemyQueue() {
    const types = [];
    const typePool = [
      TANK_TYPE.ENEMY_BASIC,
      TANK_TYPE.ENEMY_BASIC,
      TANK_TYPE.ENEMY_BASIC,
      TANK_TYPE.ENEMY_FAST,
      TANK_TYPE.ENEMY_FAST,
      TANK_TYPE.ENEMY_POWER,
      TANK_TYPE.ENEMY_ARMOR
    ];

    for (let i = 0; i < this.totalEnemies; i++) {
      // 后期关卡更多强力敌人
      const idx = Math.min(typePool.length - 1,
        Math.floor(Math.random() * typePool.length) + Math.floor(this.level / 3));
      types.push(typePool[Math.min(idx, typePool.length - 1)]);
    }

    // 保证每关至少有一个power型敌人（掉落道具的关键）
    if (!types.includes(TANK_TYPE.ENEMY_POWER) && this.level >= 1) {
      types[Math.floor(Math.random() * types.length)] = TANK_TYPE.ENEMY_POWER;
    }

    return types;
  }

  spawnEnemy() {
    if (this.enemySpawnQueue.length === 0) return;
    if (this.enemies.length >= MAX_ENEMIES_ON_SCREEN) return;

    const spawnPoint = this.enemySpawnPoints[Math.floor(Math.random() * 3)];
    const pos = this.gridToCanvas(spawnPoint.col, spawnPoint.row);

    // 检查出生点是否被占据
    const occupied = this.enemies.some(e => {
      const dx = e.x - pos.x, dy = e.y - pos.y;
      return Math.sqrt(dx*dx + dy*dy) < TANK_SIZE;
    });
    if (occupied) return;

    const type = this.enemySpawnQueue.shift();
    const enemy = new EnemyTank(pos.x, pos.y, type, this.map);
    this.enemies.push(enemy);
  }

  update() {
    // 菜单和结束画面按键处理
    if (this.state === GAME_STATE.MENU || this.state === GAME_STATE.GAME_OVER) {
      if (KeyInput.start) {
        this.startGame();
      }
      KeyInput.clearJustPressed();
      return;
    }

    if (this.state !== GAME_STATE.PLAYING) return;

    this.frameCount++;

    // 更新震动
    if (this.shakeTimer > 0) this.shakeTimer--;

    // 更新消息
    if (this.messageTimer > 0) this.messageTimer--;

    // 更新玩家
    this.player.update(this.map);

    // 玩家射击
    if (KeyInput.shoot && this.player.alive) {
      const bullet = this.player.shoot('player');
      if (bullet) {
        this.allBullets.push(bullet);
        Sound.play('shoot');
      }
    }

    // 更新敌人
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      enemy.update(this.player.x, this.player.y, [this.player, ...this.enemies]);

      // 敌人射击
      if (enemy.shootCooldown === 0 && Math.random() < 0.015) {
        const bullet = enemy.shoot('enemy');
        if (bullet) {
          this.allBullets.push(bullet);
        }
      }
    }

    // 更新子弹 & 碰撞检测
    this._updateBullets();

    // 更新道具
    for (const pu of this.powerUps) {
      pu.update();
      // 道具碰撞玩家
      if (pu.active && this.player.alive) {
        const dx = pu.x - this.player.x;
        const dy = pu.y - this.player.y;
        if (Math.sqrt(dx*dx + dy*dy) < (TANK_SIZE + pu.size) / 2) {
          this._collectPowerUp(pu);
        }
      }
    }
    this.powerUps = this.powerUps.filter(p => p.active);

    // 清除死掉的敌人
    for (const enemy of this.enemies) {
      if (!enemy.alive) {
        this.score += enemy.getScore();
        this.enemiesKilled++;

        // 道具掉落概率
        let dropChance = 0.15;
        if (enemy.type === TANK_TYPE.ENEMY_POWER) dropChance = 0.6;
        if (Math.random() < dropChance) {
          const types = [POWERUP_TYPE.STAR, POWERUP_TYPE.TANK, POWERUP_TYPE.CLOCK, POWERUP_TYPE.SHIELD, POWERUP_TYPE.BOMB];
          const weights = [0.3, 0.25, 0.15, 0.15, 0.15];
          const r = Math.random();
          let cum = 0;
          let chosenType = types[0];
          for (let i = 0; i < types.length; i++) {
            cum += weights[i];
            if (r < cum) { chosenType = types[i]; break; }
          }
          this.powerUps.push(new PowerUp(enemy.x, enemy.y, chosenType));
        }

        Sound.play('explosion');
        this.shakeTimer = 10;
        this.shakeIntensity = 3;
      }
    }
    this.enemies = this.enemies.filter(e => e.alive);

    // 生成敌人
    if (this.enemySpawnTimer > 0) {
      this.enemySpawnTimer--;
    } else if (this.enemySpawnQueue.length > 0 && this.enemies.length < MAX_ENEMIES_ON_SCREEN) {
      this.spawnEnemy();
      this.enemySpawnTimer = 90; // 1.5秒间隔
    }

    // 检测坦克间碰撞
    this._checkTankCollisions();

    // 胜利条件
    if (this.enemiesKilled >= this.totalEnemies && this.enemies.length === 0) {
      this._levelComplete();
    }

    // 败北条件：基地被毁或玩家生命耗尽
    if (!this.map.baseAlive || (!this.player.alive && this.player.lives <= 0)) {
      this._gameOver();
    }

    // 玩家死亡后复活
    if (!this.player.alive && this.player.lives > 0) {
      this._respawnPlayer();
    }

    // 清除本帧已消耗的按键
    KeyInput.clearJustPressed();
  }

  _updateBullets() {
    this.allBullets = this.allBullets.filter(b => b.active);

    for (const bullet of this.allBullets) {
      bullet.update();

      // 边界外
      if (!bullet.isInBounds()) {
        bullet.active = false;
        continue;
      }

      // 子弹击中墙壁
      const hit = this.map.checkBulletHit(bullet.x, bullet.y);
      if (hit) {
        if (hit === 'border') {
          bullet.active = false;
        } else if (hit.type === 'brick') {
          this.map.destroyBrick(hit.col, hit.row);
          bullet.active = false;
          Sound.play('hit');
        } else if (hit.type === 'steel') {
          // 玩家3级威力可摧毁钢墙
          if (bullet.ownerType === 'player' && this.player.powerLevel >= 3) {
            // 钢墙不能摧毁，但这里我们可以让子弹穿透...不，保持钢墙坚不可摧
          }
          bullet.active = false;
          Sound.play('hit');
        } else if (hit.type === 'base') {
          this.map.destroyBase();
          bullet.active = false;
          Sound.play('explosion');
          this.shakeTimer = 20;
          this.shakeIntensity = 6;
          this.messageText = '基地被摧毁！';
          this.messageTimer = 120;
        }
        continue;
      }

      // 子弹击中玩家
      if (bullet.ownerType === 'enemy' && this.player.alive && !this.player.invincible) {
        const dx = bullet.x - this.player.x;
        const dy = bullet.y - this.player.y;
        if (Math.abs(dx) < TANK_SIZE/2 && Math.abs(dy) < TANK_SIZE/2) {
          bullet.active = false;
          this.player.takeDamage();
          Sound.play('hit');
          if (!this.player.alive) {
            const hasMoreLives = this.player.loseLife();
            Sound.play('explosion');
            this.shakeTimer = 10;
            this.shakeIntensity = 4;
            if (!hasMoreLives) {
              this.messageText = '生命耗尽！';
              this.messageTimer = 120;
            }
          }
          continue;
        }
      }

      // 子弹击中敌人
      if (bullet.ownerType === 'player') {
        for (const enemy of this.enemies) {
          if (!enemy.alive) continue;
          const dx = bullet.x - enemy.x;
          const dy = bullet.y - enemy.y;
          if (Math.abs(dx) < TANK_SIZE/2 && Math.abs(dy) < TANK_SIZE/2) {
            bullet.active = false;
            enemy.takeDamage();
            Sound.play(enemy.alive ? 'hit' : 'explosion');
            if (!enemy.alive) {
              this.shakeTimer = 5;
              this.shakeIntensity = 2;
            }
            break;
          }
        }
      }

      // 子弹互撞
      for (const other of this.allBullets) {
        if (other === bullet || !other.active) continue;
        if (bullet.ownerType !== other.ownerType) {
          const dx = bullet.x - other.x;
          const dy = bullet.y - other.y;
          if (Math.abs(dx) < BULLET_SIZE * 2 && Math.abs(dy) < BULLET_SIZE * 2) {
            bullet.active = false;
            other.active = false;
            break;
          }
        }
      }
    }

    this.allBullets = this.allBullets.filter(b => b.active);
  }

  _checkTankCollisions() {
    const allTanks = [this.player, ...this.enemies].filter(t => t.alive);

    for (let i = 0; i < allTanks.length; i++) {
      for (let j = i + 1; j < allTanks.length; j++) {
        if (allTanks[i].collidesWith(allTanks[j])) {
          // 推开两个坦克
          const a = allTanks[i], b = allTanks[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < TANK_SIZE && dist > 0) {
            const overlap = TANK_SIZE - dist;
            const nx = dx / dist, ny = dy / dist;
            a.x -= nx * overlap / 2;
            a.y -= ny * overlap / 2;
            b.x += nx * overlap / 2;
            b.y += ny * overlap / 2;
          }
        }
      }
    }
  }

  _respawnPlayer() {
    // 检查出生点是否被占据
    const pos = this.gridToCanvas(this.playerSpawnPos.col, this.playerSpawnPos.row);
    const occupied = this.enemies.some(e => {
      const dx = e.x - pos.x, dy = e.y - pos.y;
      return Math.sqrt(dx*dx + dy*dy) < TANK_SIZE * 2;
    });

    if (!occupied) {
      this.player.x = pos.x;
      this.player.y = pos.y;
      this.player.dir = DIR.UP;
      this.player.alive = true;
      this.player.health = this.player.maxHealth;
      this.player.bullets = [];
      this.player.invincible = true;
      this.player.invincibleTimer = 150; // 2.5秒无敌
    }
  }

  _collectPowerUp(pu) {
    pu.active = false;
    Sound.play('powerup');

    switch (pu.type) {
      case POWERUP_TYPE.STAR:
        this.player.upgrade();
        this.messageText = '火力升级！(' + this.player.powerLevel + '级)';
        this.messageTimer = 90;
        break;
      case POWERUP_TYPE.TANK:
        this.player.lives++;
        this.messageText = '额外生命+1！';
        this.messageTimer = 90;
        break;
      case POWERUP_TYPE.CLOCK:
        this.enemySpawnTimer += 300; // 暂停敌人5秒
        // 冻结场上敌人
        for (const e of this.enemies) {
          e.moveCooldown = 300;
        }
        this.messageText = '敌人暂停！';
        this.messageTimer = 90;
        break;
      case POWERUP_TYPE.SHIELD:
        this.player.invincible = true;
        this.player.invincibleTimer = 480; // 8秒
        this.messageText = '无敌护盾！';
        this.messageTimer = 90;
        break;
      case POWERUP_TYPE.BOMB:
        for (const e of this.enemies) {
          if (e.alive) {
            e.alive = false;
            this.score += e.getScore();
            this.enemiesKilled++;
          }
        }
        Sound.play('explosion');
        this.shakeTimer = 15;
        this.shakeIntensity = 5;
        this.messageText = '全屏轰炸！';
        this.messageTimer = 90;
        break;
    }
  }

  _levelComplete() {
    this.state = GAME_STATE.LEVEL_COMPLETE;
    this.messageText = '关卡 ' + (this.level + 1) + ' 通过！';
    Sound.play('levelup');

    // 延迟进入下一关
    setTimeout(() => {
      if (this.state === GAME_STATE.LEVEL_COMPLETE) {
        this.level++;
        if (this.level >= LEVELS.length) {
          this.level = 0; // 循环
        }
        this.state = GAME_STATE.PLAYING;
        this.loadLevel();
      }
    }, 2500);
  }

  _gameOver() {
    this.state = GAME_STATE.GAME_OVER;
    Sound.play('gameover');

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('tankBattleHighScore', this.highScore);
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);

    // 震动偏移
    let shakeX = 0, shakeY = 0;
    if (this.shakeTimer > 0) {
      shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
    }

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // 渲染地图
    if (this.map) this.map.render(ctx);

    // 渲染道具
    for (const pu of this.powerUps) {
      pu.render(ctx);
    }

    // 渲染敌人
    for (const enemy of this.enemies) {
      enemy.render(ctx);
    }

    // 渲染玩家
    if (this.player) this.player.render(ctx);

    // 渲染子弹
    for (const bullet of this.allBullets) {
      bullet.render(ctx);
    }

    ctx.restore();

    // UI（不受震动影响）
    this._renderUI(ctx);

    // 菜单画面
    if (this.state === GAME_STATE.MENU) {
      this._renderMenu(ctx);
    }

    // 游戏结束画面
    if (this.state === GAME_STATE.GAME_OVER) {
      this._renderGameOver(ctx);
    }

    // 关卡完成画面
    if (this.state === GAME_STATE.LEVEL_COMPLETE) {
      this._renderLevelComplete(ctx);
    }

    // 消息提示
    if (this.messageTimer > 0) {
      this._renderMessage(ctx);
    }
  }

  _renderUI(ctx) {
    const infoY = GRID_OFFSET.Y + GRID_ROWS * TILE_SIZE + 14;
    const infoX = GRID_OFFSET.X;

    // 得分
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 14px "Microsoft YaHei","SimHei",Arial';
    ctx.textAlign = 'left';
    ctx.fillText('得分: ' + this.score, infoX, infoY);

    // 生命（用爱心表示）
    const heartsX = infoX + 160;
    ctx.fillStyle = '#ef4444';
    ctx.font = '16px Arial';
    const lives = this.player ? this.player.lives : 0;
    ctx.fillText('♥ '.repeat(lives), heartsX, infoY);

    // 剩余敌人
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';
    ctx.fillText('剩余敌人: ' + (this.totalEnemies - this.enemiesKilled),
      infoX + GRID_COLS * TILE_SIZE, infoY);

    // 第二行
    const line2Y = infoY + 18;
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';
    ctx.font = '12px "Microsoft YaHei","SimHei",Arial';

    ctx.fillText('关卡: ' + (this.level + 1), infoX, line2Y);

    const pw = this.player ? this.player.powerLevel : 1;
    const powerText = pw === 1 ? '基础' : pw === 2 ? '快速' : '最强';
    ctx.fillText('火力: ' + powerText, infoX + 100, line2Y);

    ctx.textAlign = 'right';
    ctx.fillText('最高分: ' + this.highScore, infoX + GRID_COLS * TILE_SIZE, line2Y);
  }

  _renderMenu(ctx) {
    // 半透明遮罩
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);

    // 标题
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 42px "Microsoft YaHei","SimHei",Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#b45309';
    ctx.shadowBlur = 20;
    ctx.fillText('坦 克 大 战', CANVAS.WIDTH / 2, 160);
    ctx.shadowBlur = 0;

    // 副标题
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px "Microsoft YaHei","SimHei",Arial';
    ctx.fillText('BATTLE CITY', CANVAS.WIDTH / 2, 195);

    // 操作说明
    const instructions = [
      'WASD / 方向键 — 移动坦克',
      '空格 / J — 发射子弹',
      '',
      '消灭所有敌人坦克即可过关',
      '保卫基地，不要让它被摧毁！',
      '',
      '道具说明：',
      '★ 火力升级  ♥ 额外生命',
      '⏸ 暂停敌人  ● 无敌护盾',
      '✱ 全屏轰炸',
    ];

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px "Microsoft YaHei","SimHei",Arial';
    let y = 230;
    for (const line of instructions) {
      ctx.fillText(line, CANVAS.WIDTH / 2, y);
      y += line ? 22 : 10;
    }

    // 开始提示（闪烁）
    if (Math.floor(Date.now() / 600) % 2 === 0) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 22px "Microsoft YaHei","SimHei",Arial';
      ctx.fillText('点击或按空格开始游戏', CANVAS.WIDTH / 2, 440);
    }
  }

  _renderGameOver(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, CANVAS.HEIGHT / 2 - 60, CANVAS.WIDTH, 120);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 36px "Microsoft YaHei","SimHei",Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游 戏 结 束', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 - 5);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '16px "Microsoft YaHei","SimHei",Arial';
    ctx.fillText('最终得分: ' + this.score + '    点击重新开始', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 35);
  }

  _renderLevelComplete(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, CANVAS.HEIGHT / 2 - 40, CANVAS.WIDTH, 80);

    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 30px "Microsoft YaHei","SimHei",Arial';
    ctx.textAlign = 'center';
    ctx.fillText('关卡 ' + (this.level + 1) + ' 通过！', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 5);
  }

  _renderMessage(ctx) {
    const alpha = this.messageTimer < 30 ? this.messageTimer / 30 : 1;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.font = 'bold 18px "Microsoft YaHei","SimHei",Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.messageText, CANVAS.WIDTH / 2, 14);
  }

  // 游戏循环
  gameLoop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }

  start() {
    this.init();
    this.gameLoop();
  }
}
