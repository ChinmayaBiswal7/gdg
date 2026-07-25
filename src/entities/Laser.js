// Laser barrier — player must JUMP over it.
export default class Laser {
  constructor(scene, lane) {
    this.scene        = scene;
    this.lane         = lane;
    this.progress     = 0;
    this.prevProgress = 0;
    this.hit          = false;
    this.jumpCleared  = false;

    this.beam  = scene.add.image(scene.VP.x, scene.VP.y, 'laser_beam').setDepth(3);
    this.postL = scene.add.image(scene.VP.x, scene.VP.y, 'laser_post').setDepth(3);
    this.postR = scene.add.image(scene.VP.x, scene.VP.y, 'laser_post').setDepth(3);

    this._pulseT = 0;
  }

  update(dt, speed) {
    this.prevProgress = this.progress;
    this.progress    += speed * dt;
    this._pulseT     += dt * 8;

    const pos  = this.scene.entityPos(this.progress, this.lane);
    const half = 46 * pos.scale;

    this.beam.setPosition(pos.x, pos.y);
    this.beam.setScale(pos.scale * 0.92, pos.scale);
    this.beam.setDepth(3 + this.progress * 9);
    this.beam.alpha = 0.65 + Math.sin(this._pulseT) * 0.35;

    [this.postL, this.postR].forEach((p, i) => {
      p.setPosition(pos.x + (i === 0 ? -half : half), pos.y);
      p.setScale(pos.scale * 0.85);
      p.setDepth(3 + this.progress * 9 + 0.1);
    });
  }

  // Cross-threshold collision detection (guarantees no frame-skip skips)
  get isAtPlayer() {
    return (this.progress >= 0.84 && this.prevProgress <= 1.08) ||
           (this.prevProgress < 0.84 && this.progress >= 0.84);
  }

  get isDone() { return this.progress > 1.12; }

  destroy() {
    this.beam.destroy();
    this.postL.destroy();
    this.postR.destroy();
  }
}
