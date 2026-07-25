// Powerup pickup (Shield or Double Score).
export default class Shield {
  constructor(scene, lane, type = 'shield') {
    this.scene        = scene;
    this.lane         = lane;
    this.type         = type;  // 'shield' or 'double'
    this.progress     = 0;
    this.prevProgress = 0;
    this.collected    = false;

    const key   = type === 'shield' ? 'shield_pu' : 'double_pu';
    this.sprite = scene.add.image(scene.VP.x, scene.VP.y, key).setDepth(4);
  }

  update(dt, speed) {
    this.prevProgress = this.progress;
    this.progress    += speed * dt;

    const pos = this.scene.entityPos(this.progress, this.lane);
    this.sprite.setPosition(pos.x, pos.y);
    this.sprite.setScale(pos.scale * 0.85);
    this.sprite.setDepth(4 + this.progress * 9);

    // Floating bob + gentle rotation
    this.sprite.rotation = Math.sin(Date.now() * 0.005) * 0.2;
  }

  get isAtPlayer() {
    return (this.progress >= 0.84 && this.prevProgress <= 1.08) ||
           (this.prevProgress < 0.84 && this.progress >= 0.84);
  }

  get isDone() { return this.progress > 1.1 || this.collected; }

  destroy() { if (this.sprite.active) this.sprite.destroy(); }
}
