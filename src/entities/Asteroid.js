// Asteroid — dodge by moving to another lane or jumping over.
export default class Asteroid {
  constructor(scene, lane) {
    this.scene        = scene;
    this.lane         = lane;
    this.progress     = 0;    // 0 = vanishing point, 1 = at player
    this.prevProgress = 0;
    this.hit          = false;
    this.jumpCleared  = false;

    const big   = Math.random() > 0.55;
    this._key   = big ? 'asteroid_lg' : 'asteroid_sm';
    this._scale = big ? 1.25 : 1.0;

    this.sprite = scene.add.image(scene.VP.x, scene.VP.y, this._key).setDepth(3);
  }

  update(dt, speed) {
    this.prevProgress = this.progress;
    this.progress    += speed * dt;

    const pos = this.scene.entityPos(this.progress, this.lane);
    this.sprite.setPosition(pos.x, pos.y);
    this.sprite.setScale(pos.scale * this._scale);
    this.sprite.setDepth(3 + this.progress * 9);

    // Slow spin for visual interest
    this.sprite.rotation += dt * (0.6 + this.progress * 0.8);
  }

  // Cross-threshold collision detection (guarantees no frame-skip skips)
  get isAtPlayer() {
    return (this.progress >= 0.84 && this.prevProgress <= 1.08) ||
           (this.prevProgress < 0.84 && this.progress >= 0.84);
  }

  get isDone() { return this.progress > 1.12; }

  destroy() { this.sprite.destroy(); }
}
