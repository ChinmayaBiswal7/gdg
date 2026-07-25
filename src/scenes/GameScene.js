import Phaser from 'phaser';
import Player       from '../entities/Player.js';
import Asteroid     from '../entities/Asteroid.js';
import Laser        from '../entities/Laser.js';
import Star         from '../entities/Star.js';
import Shield       from '../entities/Shield.js';
import SpawnManager from '../managers/SpawnManager.js';
import UIManager    from '../managers/UIManager.js';
import SoundManager from '../managers/SoundManager.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  /* ═══════════════ INIT / CREATE ═══════════════ */

  init() {
    this.score       = 0;
    this.lives       = 3;
    this.multiplier  = 1;
    this.speed       = 0.65;   // Fast arcade initial speed
    this.gameTime    = 0;
    this.isGameOver  = false;
    this.isPaused    = false;
    this.isInvincible = false;
    this.hasShield   = false;
    this._scoreAccum = 0;
    this._roadScroll = 0;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Dynamic wide projection values based on window scale
    this.VP       = { x: W / 2, y: H * 0.28 };
    this.PLAYER_Y = H * 0.84;

    // Wide track geometry for PC & Mobile
    const trackW  = Math.min(W * 0.58, 680);
    this.LANE_X   = [W / 2 - trackW * 0.33, W / 2, W / 2 + trackW * 0.33];
    this.ROAD_L   = W / 2 - trackW * 0.5;
    this.ROAD_R   = W / 2 + trackW * 0.5;

    // Entity arrays
    this.asteroids = [];
    this.lasers    = [];
    this.stars     = [];
    this.powerups  = [];

    this._buildBackground();
    this._roadGfx = this.add.graphics().setDepth(1);

    this.player  = new Player(this);
    this.spawner = new SpawnManager(this);
    this.ui      = new UIManager(this);
    this.sfx     = new SoundManager();

    this._setupInput();
    this.sfx.startAmbient();
  }

  /* ═══════════════ PERSPECTIVE PROJECTION ═══════════════ */

  entityPos(progress, lane) {
    const lX = this.LANE_X[lane];
    return {
      x:     this.VP.x + (lX - this.VP.x) * progress,
      y:     this.VP.y + (this.PLAYER_Y - this.VP.y) * progress,
      scale: 0.12 + 0.88 * progress
    };
  }

  /* ═══════════════ FULLSCREEN DENSE NIGHT SKY & PLANETS ═══════════════ */

  _buildBackground() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Base gradient fill spanning 100% of viewport
    const base = this.add.graphics().setDepth(0);
    base.fillGradientStyle(0x020510, 0x020510, 0x08041c, 0x08041c, 1);
    base.fillRect(0, 0, W, H);

    // Static colorful cosmic nebula wisps across 100% width
    base.fillStyle(0x4c1d95, 0.12); base.fillEllipse(W * 0.22, H * 0.18, W * 0.45, H * 0.28);
    base.fillStyle(0x1e3a8a, 0.10); base.fillEllipse(W * 0.78, H * 0.16, W * 0.5, H * 0.32);
    base.fillStyle(0x831843, 0.08); base.fillEllipse(W * 0.5, H * 0.1, W * 0.65, H * 0.22);
    base.fillStyle(0x0284c7, 0.06); base.fillEllipse(W * 0.1, H * 0.5, W * 0.35, H * 0.4);
    base.fillStyle(0x7c3aed, 0.06); base.fillEllipse(W * 0.9, H * 0.5, W * 0.35, H * 0.4);

    // 350+ Parallax star field across 4 depth layers covering whole screen
    const layerDefs = [
      { count: Math.floor(W * 0.25), minR: 0.3, maxR: 0.9,  minA: 0.10, maxA: 0.45, spd: 7  },
      { count: Math.floor(W * 0.18), minR: 0.6, maxR: 1.3,  minA: 0.30, maxA: 0.70, spd: 20 },
      { count: Math.floor(W * 0.10), minR: 1.1, maxR: 2.0,  minA: 0.55, maxA: 0.90, spd: 40 },
      { count: Math.floor(W * 0.05), minR: 1.8, maxR: 3.0,  minA: 0.70, maxA: 1.00, spd: 65 }
    ];

    this._starLayers = layerDefs.map(def => {
      const layer = [];
      for (let i = 0; i < def.count; i++) {
        const s = this.add.circle(
          Phaser.Math.Between(0, W),
          Phaser.Math.Between(0, H),
          Phaser.Math.FloatBetween(def.minR, def.maxR),
          0xffffff,
          Phaser.Math.FloatBetween(def.minA, def.maxA)
        ).setDepth(0);
        s._spd   = def.spd * Phaser.Math.FloatBetween(0.7, 1.3);
        s._base  = s.alpha;
        s._phase = Math.random() * Math.PI * 2;
        layer.push(s);
      }
      return layer;
    });

    // High-detail animated planets
    const makePlanet = (ox, oy, drawFn) => {
      const g = this.add.graphics().setDepth(0);
      g._ox = ox; g._oy = oy; g._draw = drawFn; g._draw(g, ox, oy);
      return g;
    };

    this._planets = [
      // Left Detailed Purple/Cyan Gas Giant
      makePlanet(W * 0.14, H * 0.18, (g, x, y) => {
        g.clear();
        g.fillStyle(0x7c3aed, 0.25); g.fillCircle(x, y, 72);
        g.fillStyle(0x4c1d95, 0.85); g.fillCircle(x, y, 58);
        g.fillStyle(0x6d28d9, 0.6);  g.fillEllipse(x, y - 14, 106, 24);
        g.fillStyle(0x0284c7, 0.5);  g.fillEllipse(x + 6, y + 8, 98, 20);
        g.fillStyle(0xa855f7, 0.4);  g.fillEllipse(x - 8, y + 24, 86, 14);
        g.lineStyle(6, 0xc084fc, 0.45); g.strokeEllipse(x, y, 156, 34);
        g.lineStyle(2, 0xe9d5ff, 0.7);  g.strokeEllipse(x, y, 170, 38);
      }),
      // Right Detailed Earth-like Ocean Planet
      makePlanet(W * 0.86, H * 0.22, (g, x, y) => {
        g.clear();
        g.fillStyle(0x0284c7, 0.3);  g.fillCircle(x, y, 54);
        g.fillStyle(0x0369a1, 0.9);  g.fillCircle(x, y, 44);
        g.fillStyle(0x15803d, 0.8);
        g.fillCircle(x - 14, y - 8, 18);
        g.fillCircle(x + 12, y + 10, 20);
        g.fillCircle(x - 6, y + 14, 14);
        g.fillStyle(0xffffff, 0.55);
        g.fillEllipse(x - 4, y - 18, 58, 12);
        g.fillEllipse(x + 8, y + 4, 64, 10);
      }),
      // Small cratered moon
      makePlanet(W * 0.78, H * 0.09, (g, x, y) => {
        g.clear();
        g.fillStyle(0x94a3b8, 0.85); g.fillCircle(x, y, 18);
        g.fillStyle(0x475569, 0.7);
        g.fillCircle(x - 5, y - 2, 6);
        g.fillCircle(x + 5, y + 5, 5);
      })
    ];

    this._bgTime = 0;
    this._scheduleShootingStar();
  }

  _updateBackground(dt) {
    this._bgTime += dt;
    const t = this._bgTime;
    const W = this.scale.width;
    const H = this.scale.height;

    this._starLayers.forEach(layer => {
      layer.forEach(s => {
        s.y += s._spd * dt;
        if (s.y > H) {
          s.y = 0;
          s.x = Phaser.Math.Between(0, W);
        }
        s._phase += dt * (1.5 + s._spd * 0.02);
        s.alpha = Math.max(0.05, s._base * (0.65 + Math.sin(s._phase) * 0.35));
      });
    });

    const drift = (ox, oy, ax, ay, fx, fy) => ({
      x: ox + Math.sin(t * fx) * ax,
      y: oy + Math.cos(t * fy) * ay
    });

    const p0pos = drift(W * 0.14, H * 0.18, 6, 3, 0.14, 0.09);
    const p1pos = drift(W * 0.86, H * 0.22, 5, 2.5, 0.11, 0.13);
    const p2pos = drift(W * 0.78, H * 0.09, 7, 3.5, 0.17, 0.11);

    this._planets[0]._draw(this._planets[0], p0pos.x, p0pos.y);
    this._planets[1]._draw(this._planets[1], p1pos.x, p1pos.y);
    this._planets[2]._draw(this._planets[2], p2pos.x, p2pos.y);
  }

  _scheduleShootingStar() {
    this.time.delayedCall(
      Phaser.Math.Between(2200, 6000),
      this._fireStar, [], this
    );
  }

  _fireStar() {
    if (this.isGameOver) return;
    const W = this.scale.width;
    const x1 = Phaser.Math.Between(40, W - 40);
    const y1 = Phaser.Math.Between(15, this.VP.y);
    const ang = Phaser.Math.FloatBetween(0.38, 0.92);
    const len = Phaser.Math.Between(70, 160);
    const x2 = x1 + Math.cos(ang) * len;
    const y2 = y1 + Math.sin(ang) * len;

    const sg = this.add.graphics().setDepth(1).setAlpha(0);
    sg.lineStyle(2, 0xffffff, 1);
    sg.lineBetween(x1, y1, x2, y2);
    sg.fillStyle(0xffffff, 1); sg.fillCircle(x1, y1, 2.5);

    this.tweens.add({
      targets: sg, alpha: 1, duration: 80,
      onComplete: () => {
        this.tweens.add({
          targets: sg, x: Math.cos(ang) * len * 2.5, y: Math.sin(ang) * len * 2.5, alpha: 0,
          duration: 450, ease: 'Cubic.Out',
          onComplete: () => { sg.destroy(); this._scheduleShootingStar(); }
        });
      }
    });
  }

  /* ═══════════════ ROAD RENDERING ═══════════════ */

  _drawRoad() {
    const g  = this._roadGfx;
    const W  = this.scale.width;
    const bY = this.scale.height;
    g.clear();

    // Metallic Trapezoid Road surface
    g.fillStyle(0x0b0b1e, 1);
    g.fillPoints([
      { x: this.VP.x, y: this.VP.y },
      { x: this.ROAD_R, y: bY },
      { x: this.ROAD_L, y: bY }
    ], true);

    // Glowing Neon Edge Lines
    g.lineStyle(14, 0x00d4ff, 0.12);
    g.beginPath(); g.moveTo(this.VP.x, this.VP.y); g.lineTo(this.ROAD_L, bY); g.strokePath();
    g.beginPath(); g.moveTo(this.VP.x, this.VP.y); g.lineTo(this.ROAD_R, bY); g.strokePath();

    g.lineStyle(4, 0x00d4ff, 0.95);
    g.beginPath(); g.moveTo(this.VP.x, this.VP.y); g.lineTo(this.ROAD_L, bY); g.strokePath();
    g.beginPath(); g.moveTo(this.VP.x, this.VP.y); g.lineTo(this.ROAD_R, bY); g.strokePath();

    // Lane Dividers
    g.lineStyle(2, 0x1a3a5c, 0.7);
    g.beginPath(); g.moveTo(this.VP.x, this.VP.y); g.lineTo(this.ROAD_L + (this.ROAD_R - this.ROAD_L) * 0.333, bY); g.strokePath();
    g.beginPath(); g.moveTo(this.VP.x, this.VP.y); g.lineTo(this.ROAD_L + (this.ROAD_R - this.ROAD_L) * 0.667, bY); g.strokePath();

    // Horizontal Scrolling Stripes
    const totalH    = bY - this.VP.y;
    const numLines  = 16;
    const spacing   = totalH / (numLines - 1);
    const scrollOff = this._roadScroll % spacing;

    for (let i = -1; i <= numLines; i++) {
      const rawY = this.VP.y + i * spacing + scrollOff;
      if (rawY < this.VP.y + 2 || rawY > bY) continue;

      const frac = (rawY - this.VP.y) / totalH;
      const rl   = this.VP.x + (this.ROAD_L - this.VP.x) * frac;
      const rr   = this.VP.x + (this.ROAD_R - this.VP.x) * frac;

      g.lineStyle(frac * 2.5 + 0.5, 0x1a3060, frac * 0.4 + 0.05);
      g.beginPath(); g.moveTo(rl, rawY); g.lineTo(rr, rawY); g.strokePath();
    }
  }

  /* ═══════════════ INPUT ═══════════════ */

  _setupInput() {
    const kb = this.input.keyboard;
    kb.on('keydown-LEFT',  () => this._onLeft());
    kb.on('keydown-RIGHT', () => this._onRight());
    kb.on('keydown-UP',    () => this._onJump());
    kb.on('keydown-SPACE', () => this._onJump());
    kb.on('keydown-DOWN',  () => this._onSlide());
    kb.on('keydown-P',     () => this.togglePause());
    kb.on('keydown-ESC',   () => this.togglePause());

    let sx, sy;
    this.input.on('pointerdown', p => { sx = p.x; sy = p.y; });
    this.input.on('pointerup', p => {
      const dx = p.x - sx, dy = p.y - sy;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 28) {
        dx > 0 ? this._onRight() : this._onLeft();
      } else if (Math.abs(dy) > 28) {
        dy < 0 ? this._onJump() : this._onSlide();
      }
    });
  }

  _onLeft()  { if (!this._blocked()) this.player.tryMoveLane(-1); }
  _onRight() { if (!this._blocked()) this.player.tryMoveLane( 1); }
  _onJump()  { if (!this._blocked() && this.player.tryJump()) this.sfx.playJump(); }
  _onSlide() { if (!this._blocked()) this.player.trySlide(); }
  _blocked() { return this.isPaused || this.isGameOver; }

  togglePause() {
    if (this.isGameOver) return;
    this.isPaused = !this.isPaused;
    this.ui.setPaused(this.isPaused);
    this.isPaused ? this.sfx.pause() : this.sfx.resume();
  }

  /* ═══════════════ MAIN UPDATE LOOP ═══════════════ */

  update(time, delta) {
    if (this.isGameOver || this.isPaused) return;

    const dt = delta / 1000;
    this.gameTime += dt;

    // PRO MAX speed scaling: scales continuously with gameTime AND score!
    this.speed = Math.min(1.48, 0.65 + (this.gameTime * 0.012) + (this.score * 0.00035));

    this._scoreAccum += dt * this.speed * 55 * this.multiplier;
    if (this._scoreAccum >= 1) {
      const pts = Math.floor(this._scoreAccum);
      this.score       += pts;
      this._scoreAccum -= pts;
      this.ui.updateScore(this.score);
    }

    this._roadScroll += this.speed * delta * 0.58;
    this._drawRoad();

    this.player.update(dt);
    this.player.drawShield(this.hasShield);
    this.isInvincible ? this.player.flash(time) : this.player.resetAlpha();

    this._tickAsteroids(dt);
    this._tickLasers(dt);
    this._tickStars(dt);
    this._tickPowerups(dt);

    this.spawner.update(dt, this.speed, this.gameTime);
    this._updateBackground(dt);
  }

  /* ═══════════════ ENTITY TICKS WITH PERFECT JUMP COLLISION ═══════════════ */

  _tickAsteroids(dt) {
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const a = this.asteroids[i];
      a.update(dt, this.speed);

      if (!a.hit && a.isAtPlayer && a.lane === this.player.lane) {
        const airborne = this.player.y < this.PLAYER_Y - 12 || this.player._jumping;
        if (airborne) {
          a.jumpCleared = true;
        }

        if (!a.jumpCleared && !this.isInvincible) {
          a.hit = true;
          this._onPlayerHit();
        }
      }
      if (a.isDone) { a.destroy(); this.asteroids.splice(i, 1); }
    }
  }

  _tickLasers(dt) {
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const l = this.lasers[i];
      l.update(dt, this.speed);

      if (!l.hit && l.isAtPlayer && l.lane === this.player.lane) {
        const airborne = this.player.y < this.PLAYER_Y - 12 || this.player._jumping;
        if (airborne) {
          l.jumpCleared = true;
        }

        if (!l.jumpCleared && !this.isInvincible) {
          l.hit = true;
          this._onPlayerHit();
        }
      }
      if (l.isDone) { l.destroy(); this.lasers.splice(i, 1); }
    }
  }

  _tickStars(dt) {
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const s = this.stars[i];
      s.update(dt, this.speed);

      if (!s.collected && s.isAtPlayer && s.lane === this.player.lane) {
        s.collected = true;
        this._collectStar(s);
      }
      if (s.isDone) { s.destroy(); this.stars.splice(i, 1); }
    }
  }

  _tickPowerups(dt) {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.update(dt, this.speed);

      if (!p.collected && p.isAtPlayer && p.lane === this.player.lane) {
        p.collected = true;
        this._activatePowerup(p.type);
        this.sfx.playPowerup();
        p.destroy();
        this.powerups.splice(i, 1);
        continue;
      }
      if (p.isDone) { p.destroy(); this.powerups.splice(i, 1); }
    }
  }

  /* ═══════════════ GAME EVENTS ═══════════════ */

  _collectStar(star) {
    const pts = 10 * this.multiplier;
    this.score += pts;
    this.ui.updateScore(this.score);
    this.sfx.playCoin();

    const txt = this.add.text(star.sprite.x, star.sprite.y, `+${pts}`, {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 3
    }).setDepth(20).setOrigin(0.5);

    this.tweens.add({
      targets: txt, y: txt.y - 58, alpha: 0,
      duration: 720, ease: 'Cubic.Out',
      onComplete: () => txt.destroy()
    });
  }

  _activatePowerup(type) {
    if (type === 'shield') {
      this.hasShield = true;
      this.ui.showShield(true);
    } else if (type === 'double') {
      this.multiplier = 2;
      this.ui.updateMultiplier(2);
      if (this._doubleTimer) this._doubleTimer.remove();
      this._doubleTimer = this.time.delayedCall(10000, () => {
        this.multiplier = 1;
        this.ui.updateMultiplier(1);
      });
    } else if (type === 'rocket') {
      this.player.startRocketFlight();
      this._startInvincibility(5.0);
      if (this._rocketTimer) this._rocketTimer.remove();
      this._rocketTimer = this.time.delayedCall(5000, () => {
        this.player.stopRocketFlight();
      });
    }

    const W = this.scale.width;
    const label = type === 'shield' ? '🛡 SHIELD' : (type === 'double' ? '⚡ x2 SCORE' : '🚀 ROCKET BOOST!');
    const color = type === 'shield' ? '#60a5fa' : (type === 'double' ? '#00ffff' : '#ff5500');
    const pop = this.add.text(W / 2, 180, label, {
      fontFamily: 'monospace', fontSize: '26px', fontStyle: 'bold',
      color: color,
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(25);
    this.tweens.add({
      targets: pop, y: 130, alpha: 0, duration: 1400, ease: 'Cubic.Out',
      onComplete: () => pop.destroy()
    });
  }

  _onPlayerHit() {
    if (this.hasShield) {
      this.hasShield = false;
      this.ui.showShield(false);
      this.sfx.playShieldBreak();
      this._startInvincibility(1.6);
      this._flash(0x3b82f6, 0.3, 300);
      return;
    }

    this.lives--;
    this.ui.updateLives(this.lives);
    this.sfx.playHit();
    this._flash(0xff0000, 0.42, 320);
    this._startInvincibility(0.5);

    this.cameras.main.shake(240, 0.014);

    if (this.lives <= 0) this._triggerGameOver();
  }

  _startInvincibility(seconds) {
    this.isInvincible = true;
    if (this._invTimer) this._invTimer.remove();
    this._invTimer = this.time.delayedCall(seconds * 1000, () => {
      this.isInvincible = false;
      this.player.resetAlpha();
    });
  }

  _flash(color, alpha, duration) {
    const W = this.scale.width;
    const H = this.scale.height;
    const rect = this.add.rectangle(W / 2, H / 2, W, H, color, alpha).setDepth(50);
    this.tweens.add({ targets: rect, alpha: 0, duration, onComplete: () => rect.destroy() });
  }

  _triggerGameOver() {
    this.isGameOver = true;
    this.sfx.stopAmbient();
    this.sfx.playGameOver();
    this._flash(0xff0000, 0.28, 600);

    const best = Math.max(parseInt(localStorage.getItem('dod_best') || '0'), this.score);
    localStorage.setItem('dod_best', best.toString());

    this.time.delayedCall(1300, () => {
      this.scene.start('GameOverScene', { score: this.score, best });
    });
  }

  /* ═══════════════ SPAWN API ═══════════════ */

  _spawnObstacleInLane(lane) {
    if (Math.random() < 0.55) this.spawnAsteroid(lane);
    else                       this.spawnLaser(lane);
  }

  spawnAsteroid(lane) { this.asteroids.push(new Asteroid(this, lane)); }
  spawnLaser(lane)    { this.lasers.push(new Laser(this, lane)); }
  spawnStar(lane)     { this.stars.push(new Star(this, lane)); }
  spawnPowerup(lane, type) { this.powerups.push(new Shield(this, lane, type)); }
}
