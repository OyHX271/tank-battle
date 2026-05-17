// 关卡地图数据与地图类

// 0=空地 1=砖墙 2=钢墙 3=基地
const LEVELS = [
  // 第1关 - 经典布局
  [
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,0,1,1,0,1,1,0,0,0],
    [0,0,0,1,0,0,0,0,0,1,0,0,0],
    [0,1,0,0,0,0,0,0,0,0,0,1,0],
    [0,1,0,1,0,0,0,0,0,1,0,1,0],
    [0,0,0,0,0,1,1,1,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,1,0,0,0],
    [0,0,0,0,0,1,0,1,0,0,0,0,0],
    [0,1,0,0,0,0,2,0,0,0,0,1,0],
    [0,1,0,1,1,0,0,0,1,1,0,1,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,3,0,0,0,0,0,0],
  ],
  // 第2关 - 更多障碍
  [
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,0,1,0,0,0,1,0,1,1,0],
    [0,0,1,0,1,0,2,0,1,0,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,0,1,0,1,1,1,0,1,0,1,0],
    [0,1,0,0,0,0,1,0,0,0,0,1,0],
    [0,0,0,1,0,0,0,0,0,1,0,0,0],
    [0,0,1,0,0,1,0,1,0,0,1,0,0],
    [0,0,0,0,0,0,2,0,0,0,0,0,0],
    [0,0,1,0,1,0,1,0,1,0,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,3,0,0,0,0,0,0],
  ],
  // 第3关 - 迷宫风格
  [
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,0,1,0,1,0,1,0,1,0,1,0],
    [0,1,0,1,0,1,0,1,0,1,0,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,0,0,1,1,2,1,1,0,0,1,0],
    [0,0,0,1,0,0,0,0,0,1,0,0,0],
    [0,0,1,0,0,1,0,1,0,0,1,0,0],
    [0,0,0,1,0,0,0,0,0,1,0,0,0],
    [0,1,0,0,1,1,2,1,1,0,0,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,0,1,0,1,0,1,0,1,0,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,3,0,0,0,0,0,0],
  ],
  // 第4关 - 更多钢铁
  [
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,2,0,0,0,2,0,0,0,0],
    [0,0,1,0,0,0,1,0,0,0,1,0,0],
    [0,0,0,0,1,0,0,0,1,0,0,0,0],
    [0,2,0,1,1,0,0,0,1,1,0,2,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,1,0,0,0,1,0,0,0,1,0,0],
    [0,0,0,0,1,0,0,0,1,0,0,0,0],
    [0,2,0,0,1,0,2,0,1,0,0,2,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,0,0,1,0,1,0,0,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,3,0,0,0,0,0,0],
  ],
  // 第5关 - 最终关卡
  [
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,0,1,0,1,2,1,0,1,0,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,0,1,1,0,0,0,1,1,0,1,0],
    [0,0,0,0,1,0,2,0,1,0,0,0,0],
    [0,0,1,0,0,0,0,0,0,0,1,0,0],
    [0,0,0,1,0,1,0,1,0,1,0,0,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,1,0,2,0,1,0,2,0,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,0,1,1,0,1,0,1,1,0,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,3,0,0,0,0,0,0],
  ]
];

class Map {
  constructor(levelIndex) {
    this.loadLevel(levelIndex);
  }

  loadLevel(index) {
    const levelData = LEVELS[index % LEVELS.length];
    this.grid = levelData.map(row => [...row]);
    this.baseAlive = true;
    this.basePos = null;

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.grid[r][c] === TILE.BASE) {
          this.basePos = { col: c, row: r };
        }
      }
    }
  }

  // 将画布坐标转为网格坐标
  canvasToGrid(canvasX, canvasY) {
    const col = Math.floor((canvasX - GRID_OFFSET.X) / TILE_SIZE);
    const row = Math.floor((canvasY - GRID_OFFSET.Y) / TILE_SIZE);
    return { col, row };
  }

  // 获取指定格子类型
  getTile(col, row) {
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) {
      return TILE.STEEL; // 边界外视为钢墙
    }
    return this.grid[row][col];
  }

  // 检查矩形区域是否与墙壁碰撞
  collidesWithWall(left, top, right, bottom) {
    const tl = this.canvasToGrid(left, top);
    const tr = this.canvasToGrid(right, top);
    const bl = this.canvasToGrid(left, bottom);
    const br = this.canvasToGrid(right, bottom);

    const cells = new Set();
    [tl, tr, bl, br].forEach(p => cells.add(`${p.col},${p.row}`));

    for (const key of cells) {
      const [col, row] = key.split(',').map(Number);
      const tile = this.getTile(col, row);
      if (tile === TILE.BRICK || tile === TILE.STEEL || tile === TILE.BASE) {
        return true;
      }
    }
    return false;
  }

  // 检查子弹是否击中墙壁
  checkBulletHit(bulletX, bulletY) {
    const col = Math.floor((bulletX - GRID_OFFSET.X) / TILE_SIZE);
    const row = Math.floor((bulletY - GRID_OFFSET.Y) / TILE_SIZE);

    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) {
      return 'border'; // 飞出边界
    }

    const tile = this.getTile(col, row);
    if (tile === TILE.BRICK) return { type: 'brick', col, row };
    if (tile === TILE.STEEL) return { type: 'steel', col, row };
    if (tile === TILE.BASE) return { type: 'base', col, row };
    return null;
  }

  // 摧毁砖墙
  destroyBrick(col, row) {
    if (this.grid[row][col] === TILE.BRICK) {
      this.grid[row][col] = TILE.EMPTY;
      return true;
    }
    return false;
  }

  // 摧毁基地
  destroyBase() {
    if (this.basePos) {
      this.grid[this.basePos.row][this.basePos.col] = TILE.EMPTY;
      this.baseAlive = false;
    }
  }

  // 环绕基地的砖墙
  protectBase() {
    if (!this.basePos) return;
    const { col, row } = this.basePos;
    const neighbors = [
      [-1,-1],[0,-1],[1,-1],
      [-1, 0],        [1, 0],
      [-1, 1],[0, 1],[1, 1]
    ];
    neighbors.forEach(([dc, dr]) => {
      const c = col + dc, r = row + dr;
      if (c >= 0 && c < GRID_COLS && r >= 0 && r < GRID_ROWS) {
        if (this.grid[r][c] === TILE.EMPTY) {
          this.grid[r][c] = TILE.BRICK;
        }
      }
    });
  }

  // 渲染地图
  render(ctx) {
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const x = GRID_OFFSET.X + c * TILE_SIZE;
        const y = GRID_OFFSET.Y + r * TILE_SIZE;
        const tile = this.grid[r][c];

        if (tile === TILE.EMPTY) {
          // 绘制网格背景
          ctx.fillStyle = COLORS.GRID_BG;
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        } else if (tile === TILE.BRICK) {
          // 砖墙
          ctx.fillStyle = COLORS.BRICK;
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          // 砖块纹理
          ctx.fillStyle = COLORS.BRICK_DARK;
          ctx.fillRect(x, y, TILE_SIZE, 1);
          ctx.fillRect(x, y + TILE_SIZE/2, TILE_SIZE, 1);
          ctx.fillRect(x + TILE_SIZE/2, y, 1, TILE_SIZE/2);
          ctx.fillRect(x + TILE_SIZE/4, y + TILE_SIZE/2, 1, TILE_SIZE/2);
          ctx.fillRect(x + 3*TILE_SIZE/4, y + TILE_SIZE/2, 1, TILE_SIZE/2);
        } else if (tile === TILE.STEEL) {
          // 钢墙
          ctx.fillStyle = COLORS.STEEL;
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = COLORS.STEEL_LIGHT;
          ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.fillStyle = COLORS.STEEL;
          ctx.fillRect(x + 6, y + 6, TILE_SIZE - 12, TILE_SIZE - 12);
        } else if (tile === TILE.BASE) {
          // 基地（鹰）
          ctx.fillStyle = COLORS.GRID_BG;
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          this._drawEagle(ctx, x + TILE_SIZE/2, y + TILE_SIZE/2);
        }
      }
    }
  }

  _drawEagle(ctx, cx, cy) {
    const s = TILE_SIZE * 0.35;
    // 鹰形：菱形+翅膀装饰
    ctx.fillStyle = COLORS.BASE;
    ctx.beginPath();
    ctx.moveTo(cx, cy - s);
    ctx.lineTo(cx + s * 0.7, cy);
    ctx.lineTo(cx, cy + s * 0.8);
    ctx.lineTo(cx - s * 0.7, cy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 翅膀
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.7, cy);
    ctx.lineTo(cx - s * 1.1, cy - s * 0.5);
    ctx.lineTo(cx - s * 0.3, cy - s * 0.2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + s * 0.7, cy);
    ctx.lineTo(cx + s * 1.1, cy - s * 0.5);
    ctx.lineTo(cx + s * 0.3, cy - s * 0.2);
    ctx.closePath();
    ctx.fill();
  }
}
