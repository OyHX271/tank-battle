// 游戏常量配置
const TILE_SIZE = 32;
const GRID_COLS = 13;
const GRID_ROWS = 13;
const TANK_SIZE = 28;
const BULLET_SIZE = 6;

const CANVAS = {
  WIDTH: 512,
  HEIGHT: 480
};

const GRID_OFFSET = {
  X: 48,
  Y: 32
};

const TILE = {
  EMPTY: 0,
  BRICK: 1,
  STEEL: 2,
  BASE: 3
};

const DIR = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3
};

const GAME_STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  LEVEL_COMPLETE: 'levelComplete',
  GAME_OVER: 'gameOver'
};

const TANK_TYPE = {
  PLAYER: 'player',
  ENEMY_BASIC: 'basic',
  ENEMY_FAST: 'fast',
  ENEMY_POWER: 'power',
  ENEMY_ARMOR: 'armor'
};

const POWERUP_TYPE = {
  STAR: 'star',
  TANK: 'tank',
  CLOCK: 'clock',
  SHIELD: 'shield',
  BOMB: 'bomb'
};

const ENEMIES_PER_LEVEL = 20;
const MAX_ENEMIES_ON_SCREEN = 4;
const PLAYER_START_LIVES = 3;

const TANK_SPEED = {
  player: 2.5,
  basic: 1.5,
  fast: 3,
  power: 2,
  armor: 1
};

const TANK_HEALTH = {
  player: 1,
  basic: 1,
  fast: 1,
  power: 2,
  armor: 4
};

const BULLET_SPEED = {
  player: 5,
  enemy: 3
};

const COLORS = {
  BRICK: '#b45309',
  BRICK_DARK: '#7c2d12',
  STEEL: '#94a3b8',
  STEEL_LIGHT: '#cbd5e1',
  BASE: '#facc15',
  BASE_DAMAGED: '#991b1b',
  PLAYER: '#fbbf24',
  PLAYER_DARK: '#b45309',
  ENEMY_BASIC: '#94a3b8',
  ENEMY_FAST: '#60a5fa',
  ENEMY_POWER: '#f59e0b',
  ENEMY_ARMOR: '#4ade80',
  BULLET_PLAYER: '#fef3c7',
  BULLET_ENEMY: '#fca5a5',
  POWERUP_STAR: '#facc15',
  POWERUP_TANK: '#4ade80',
  POWERUP_CLOCK: '#f8fafc',
  POWERUP_SHIELD: '#60a5fa',
  POWERUP_BOMB: '#ef4444',
  BG: '#1a1a2e',
  GRID_BG: '#0f0f23'
};
