import Phaser from 'phaser';

export default class Player {
  constructor(scene) {
    this.scene = scene;

    // State
    this.lane     = 1;           // 0=left, 1=center, 2=right
    this._startX  = scene.LANE_X[1];
    this._targetX = scene.LANE_X[1];
    this._moveT   = 1;           // 1 = at target lane

    this._jumping  = false;
    this._jumpT    = 0;          // 0 → 1
    this._jumpSpd  = 2.1;        // completes in ~0.48 s

    this._sliding  = false;
    this._slideT   = 0;
    this._slideDur = 0.72;

    this.isFlyingRocket = false;

    this._runFrame = 0;
    this._runTimer = 0;

    // Sprite
    this.sprite = scene.add.image(scene.LANE_X[1], scene.PLAYER_Y, 'player_run1').setDepth(15);

    // Shield aura (separate graphics object)
    this._aura = scene.add.graphics().setDepth(16);

    // Dynamic thruster flames / particles during jump & rocket flight
    this._thrusterGfx = scene.add.graphics().setDepth(14);
    // Dynamic dust graphics for slide / landing
    this._dustGfx = scene.add.graphics().setDepth(13);

    // Squash & Stretch scale factors
    this._scaleX = 1.45;
    this._scaleY = 1.45;
  }

  startRocketFlight() {
    this.isFlyingRocket = true;
    this._jumping = false;
    this._sliding = false;
    this.sprite.setTexture('player_rocket');
    this.sprite.y = this.scene.PLAYER_Y - 95;
    this._scaleX = 1.6;
    this._scaleY = 1.6;

    // Burst dust & launch flash
    this._spawnDust(this.sprite.x, this.scene.PLAYER_Y, 20, 0xff5500);
  }

  stopRocketFlight() {
    this.isFlyingRocket = false;
    this.sprite.setTexture('player_run1');
    this.sprite.y = this.scene.PLAYER_Y;
    this._scaleX = 1.80;
    this._scaleY = 1.10;
    this._spawnDust(this.sprite.x, this.scene.PLAYER_Y, 15, 0x94a3b8);
  }

  /* ── Public controls ── */

  tryMoveLane(dir) {
    const next = Phaser.Math.Clamp(this.lane + dir, 0, 2);
    if (next === this.lane) return;
    this._startX  = this.sprite.x;
    this.lane     = next;
    this._targetX = this.scene.LANE_X[next];
    this._moveT   = 0;

    // Lean / Stretch on lane switch
    this._scaleX = dir > 0 ? 1.65 : 1.25;
    this._scaleY = 1.30;
  }

  tryJump() {
    if (this._jumping || this.isFlyingRocket) return false;
    this._jumping = true;
    this._jumpT   = 0;
    this._sliding = false;        // cancel slide
    this.sprite.setTexture('player_jump');

    // Launch stretch
    this._scaleX = 1.15;
    this._scaleY = 1.80;

    // Initial launch dust burst
    this._spawnDust(this.sprite.x, this.scene.PLAYER_Y, 12, 0x00f0ff);
    return true;
  }

  trySlide() {
    if (this._jumping || this.isFlyingRocket) return false;
    if (this._sliding) return true;
    this._sliding = true;
    this._slideT  = 0;
    this.sprite.setTexture('player_slide');

    // Slide squash
    this._scaleX = 1.80;
    this._scaleY = 1.10;
    return true;
  }

  /* ── Per-frame update ── */

  update(dt) {
    this._updateLaneSwitch(dt);
    if (!this.isFlyingRocket) {
      this._updateJump(dt);
      this._updateSlide(dt);
      this._updateRunAnim(dt);
    } else {
      // Floating bobbing motion while flying in rocket
      this.sprite.y = (this.scene.PLAYER_Y - 95) + Math.sin(Date.now() * 0.006) * 8;
    }

    // Smoothly return scale to 1.45 (or 1.6 for rocket)
    const targetScale = this.isFlyingRocket ? 1.6 : 1.45;
    this._scaleX += (targetScale - this._scaleX) * dt * 10;
    this._scaleY += (targetScale - this._scaleY) * dt * 10;
    this.sprite.setScale(this._scaleX, this._scaleY);

    // Render thruster flames if jumping or flying rocket
    this._updateThrusters(dt);
    // Render sliding spark dust
    this._updateSlideDust(dt);
  }

  _updateLaneSwitch(dt) {
    if (this._moveT >= 1) return;
    this._moveT = Math.min(1, this._moveT + dt * 7.5);
    const ease  = 1 - Math.pow(1 - this._moveT, 3);   // cubic ease-out
    this.sprite.x = this._startX + (this._targetX - this._startX) * ease;
  }

  _updateJump(dt) {
    if (!this._jumping) return;
    this._jumpT += dt * this._jumpSpd;
    if (this._jumpT >= 1) {
      this._jumpT   = 1;
      this._jumping = false;
      this.sprite.y = this.scene.PLAYER_Y;
      this.sprite.setTexture('player_run1');

      // Landing squash
      this._scaleX = 1.80;
      this._scaleY = 1.10;
      // Landing dust puff
      this._spawnDust(this.sprite.x, this.scene.PLAYER_Y, 10, 0x94a3b8);
    } else {
      this.sprite.y = this.scene.PLAYER_Y - Math.sin(this._jumpT * Math.PI) * 118;
    }
  }

  _updateSlide(dt) {
    if (!this._sliding) return;
    this._slideT += dt;
    if (this._slideT >= this._slideDur) {
      this._sliding = false;
      this.sprite.y = this.scene.PLAYER_Y;
      this.sprite.setTexture('player_run1');
    }
  }

  _updateRunAnim(dt) {
    if (this._jumping || this._sliding || this.isFlyingRocket) return;
    this._runTimer += dt;
    if (this._runTimer >= 0.12) {
      this._runTimer = 0;
      this._runFrame ^= 1;
      this.sprite.setTexture(this._runFrame === 0 ? 'player_run1' : 'player_run2');
    }
  }

  _updateThrusters(dt) {
    const g = this._thrusterGfx;
    g.clear();

    if (this._jumping) {
      const px = this.sprite.x;
      const py = this.sprite.y;

      // 1. BACK JETPACK THRUSTERS (Dual cyan/white plasma jets behind shoulders)
      const jetH = 28 + Math.sin(Date.now() * 0.05) * 12;
      g.fillStyle(0x00f0ff, 0.9);
      g.fillTriangle(px - 18, py - 6, px - 8, py - 6, px - 13, py - 6 + jetH);
      g.fillTriangle(px + 8, py - 6, px + 18, py - 6, px + 13, py - 6 + jetH);

      g.fillStyle(0xffffff, 1);
      g.fillTriangle(px - 16, py - 6, px - 10, py - 6, px - 13, py - 6 + jetH * 0.5);
      g.fillTriangle(px + 10, py - 6, px + 16, py - 6, px + 13, py - 6 + jetH * 0.5);

      // 2. BOOT THRUSTERS (Massive fiery orange/yellow launch blast under soles)
      const bootH = 42 + Math.sin(Date.now() * 0.04) * 16;
      const bootY = py + 34;

      g.fillStyle(0xff4400, 0.85);
      g.fillTriangle(px - 22, bootY, px - 2, bootY, px - 12, bootY + bootH);
      g.fillTriangle(px + 2, bootY, px + 22, bootY, px + 12, bootY + bootH);

      g.fillStyle(0xffaa00, 0.95);
      g.fillTriangle(px - 18, bootY, px - 6, bootY, px - 12, bootY + bootH * 0.7);
      g.fillTriangle(px + 6, bootY, px + 18, bootY, px + 12, bootY + bootH * 0.7);

      g.fillStyle(0xffffaa, 1);
      g.fillTriangle(px - 14, bootY, px - 10, bootY, px - 12, bootY + bootH * 0.4);
      g.fillTriangle(px + 10, bootY, px + 14, bootY, px + 12, bootY + bootH * 0.4);

      // Continuous jetpack fire spark trail
      if (Math.random() < 0.85) {
        this._spawnDust(px + (Math.random() * 20 - 10), bootY + 10, 2, Math.random() < 0.5 ? 0x00f0ff : 0xffaa00);
      }

    } else if (this.isFlyingRocket) {
      const px = this.sprite.x;
      const py = this.sprite.y + 36;

      // Massive spaceship main thruster engine fire
      const flameH = 48 + Math.sin(Date.now() * 0.06) * 18;
      g.fillStyle(0xff2200, 0.9);
      g.fillTriangle(px - 20, py, px + 20, py, px, py + flameH);

      g.fillStyle(0xffaa00, 0.95);
      g.fillTriangle(px - 13, py, px + 13, py, px, py + flameH * 0.7);

      g.fillStyle(0xffff00, 1);
      g.fillTriangle(px - 8, py, px + 8, py, px, py + flameH * 0.4);

      g.fillStyle(0xffffff, 1);
      g.fillTriangle(px - 4, py, px + 4, py, px, py + flameH * 0.2);

      if (Math.random() < 0.9) {
        this._spawnDust(px + (Math.random() * 24 - 12), py + 15, 3, 0xff5500);
      }
    }
  }

  _updateSlideDust(dt) {
    if (this._sliding && Math.random() < 0.6) {
      const px = this.sprite.x + (Math.random() * 20 - 10);
      const py = this.scene.PLAYER_Y + 12;
      this._spawnDust(px, py, 2, 0x38bdf8);
    }
  }

  _spawnDust(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const p = this.scene.add.circle(
        x + (Math.random() * 24 - 12),
        y + (Math.random() * 10 - 5),
        Phaser.Math.FloatBetween(2, 4),
        color,
        0.8
      ).setDepth(14);

      this.scene.tweens.add({
        targets: p,
        x: p.x + (Math.random() * 40 - 20),
        y: p.y - (Math.random() * 15 + 5),
        alpha: 0,
        scale: 0.2,
        duration: 350,
        ease: 'Cubic.Out',
        onComplete: () => p.destroy()
      });
    }
  }

  /* ── Shield aura ── */

  drawShield(hasShield) {
    this._aura.clear();
    if (!hasShield) return;
    const pulse = 0.6 + Math.sin(Date.now() * 0.007) * 0.35;
    this._aura.lineStyle(3, 0x0284c7, pulse);
    this._aura.strokeCircle(this.sprite.x, this.sprite.y - 4, 42);
    this._aura.lineStyle(1.5, 0x38bdf8, pulse * 0.6);
    this._aura.strokeCircle(this.sprite.x, this.sprite.y - 4, 52);
  }

  /* ── Hit flash ── */

  flash(t) { this.sprite.alpha = Math.floor(t / 80) % 2 === 0 ? 1 : 0.15; }
  resetAlpha() { this.sprite.alpha = 1; }

  /* ── Getters ── */

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }

  get isInAir() {
    return this.isFlyingRocket || (this._jumping && this._jumpT > 0.18 && this._jumpT < 0.82);
  }

  get isCrouching() { return this._sliding; }

  destroy() {
    this.sprite.destroy();
    this._aura.destroy();
    this._thrusterGfx.destroy();
    this._dustGfx.destroy();
  }
}
