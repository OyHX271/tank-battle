// 键盘输入管理
const KeyInput = {
  _keys: {},
  _justPressed: {},

  init() {
    this._keys = {};
    this._justPressed = {};
    window.addEventListener('keydown', (e) => {
      if (!this._keys[e.code]) {
        this._justPressed[e.code] = true;
      }
      this._keys[e.code] = true;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyJ','KeyW','KeyA','KeyS','KeyD'].includes(e.code)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      this._keys[e.code] = false;
    });
  },

  isDown(code) {
    return !!this._keys[code];
  },

  wasPressed(code) {
    if (this._justPressed[code]) {
      this._justPressed[code] = false;
      return true;
    }
    return false;
  },

  clearJustPressed() {
    this._justPressed = {};
  },

  // 方向
  get up()    { return this.isDown('ArrowUp')    || this.isDown('KeyW'); },
  get down()  { return this.isDown('ArrowDown')  || this.isDown('KeyS'); },
  get left()  { return this.isDown('ArrowLeft')  || this.isDown('KeyA'); },
  get right() { return this.isDown('ArrowRight') || this.isDown('KeyD'); },

  // 射击
  get shoot() { return this.wasPressed('Space') || this.wasPressed('KeyJ'); },

  // 开始/确认
  get start() { return this.wasPressed('Enter') || this.wasPressed('Space'); }
};
