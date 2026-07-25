// Star collectible — walk into the same lane to collect (+10 × multiplier).
export default class Star {
  constructor(scene, lane) {
    this.scene        = scene;
    this.lane         = lane;
    this.progress     = 0;
    this.prevProgress = 0;
    this.collected    = false;

    this.sprite = scene.add.image(scene.VP.x, scene.VP.y, 'star').setDepth(4);
  }

  update(dt, speed) {
    this.prevProgress = this.progress;
    this.progress    += speed * dt;

    const pos = this.scene.entityPos(this.progress, this.lane);
    this.sprite.setPosition(pos.x, pos.y);
    this.sprite.setScale(pos.scale * 0.82);
    this.sprite.setDepth(4 + this.progress * 9);
    this.sprite.rotation += dt * 2.2;
  }

  get isAtPlayer() {
    return (this.progress >= 0.84 && this.prevProgress <= 1.08) ||
           (this.prevProgress < 0.84 && this.progress >= 0.84);
  }

  get isDone() { return this.progress > 1.1 || this.collected; }

  destroy() { if (this.sprite.active) this.sprite.destroy(); }
}
