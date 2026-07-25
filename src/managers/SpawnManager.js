import Phaser from 'phaser';

/**
 * SpawnManager PRO MAX — High-intensity arcade runner difficulty.
 * Rapid obstacle spawning, immediate initial spawn (0.35s), and fast pattern escalation.
 */
export default class SpawnManager {
  constructor(scene) {
    this.scene      = scene;
    this._obstacleT = 0.35; // First obstacle arrives almost immediately!
    this._starT     = 0.6;
    this._powerupT  = 3.5; // First powerup arrives in 3.5 seconds!
  }

  update(dt, speed, gameTime) {
    this._obstacleT -= dt;
    this._starT     -= dt;
    this._powerupT  -= dt;

    if (this._obstacleT <= 0) {
      const base = Math.max(0.42, 1.10 - gameTime * 0.025);
      this._obstacleT = base + (Math.random() * 0.2 - 0.1);
      this._spawnPattern(gameTime);
    }

    if (this._starT <= 0) {
      this._starT = 1.0 + Math.random() * 0.8;
      this._spawnStars();
    }

    if (this._powerupT <= 0) {
      this._powerupT = 8.0 + Math.random() * 4.0;
      this._spawnPowerup();
    }
  }

  /* ── Pro Max Pattern selector ── */

  _spawnPattern(t) {
    if (t < 8) {
      // WARM-UP (0–8s): Mix of singles & doubles
      const r = Math.random();
      if (r < 0.50) this._single();
      else          this._double();

    } else if (t < 20) {
      // PHASE 2 (8–20s): Singles, Doubles & Staggered Sequences
      const r = Math.random();
      if      (r < 0.25) this._single();
      else if (r < 0.65) this._double();
      else               this._sequential();

    } else {
      // PRO MAX GAUNTLET (20s+): Heavy Doubles, Sequences & 2-Lane Gauntlets!
      const r = Math.random();
      if      (r < 0.15) this._single();
      else if (r < 0.45) this._double();
      else if (r < 0.72) this._sequential();
      else               this._gauntlet();
    }
  }

  /* ── Pattern definitions ── */

  /** One obstacle in a random lane. */
  _single() {
    this.scene._spawnObstacleInLane(Phaser.Math.Between(0, 2));
  }

  /**
   * Two obstacles in different lanes in rapid succession.
   * Player must dodge to the only open lane!
   */
  _double() {
    const lanes = Phaser.Utils.Array.Shuffle([0, 1, 2]);
    this.scene._spawnObstacleInLane(lanes[0]);
    this.scene.time.delayedCall(80, () => {
      if (!this.scene.isGameOver) this.scene._spawnObstacleInLane(lanes[1]);
    });
  }

  /**
   * Three obstacles, one per lane, staggered in fast sequence.
   * Player must do split-second lane switches!
   */
  _sequential() {
    const lanes = Phaser.Utils.Array.Shuffle([0, 1, 2]);
    [0, 280, 560].forEach((delay, i) => {
      this.scene.time.delayedCall(delay, () => {
        if (!this.scene.isGameOver) this.scene._spawnObstacleInLane(lanes[i]);
      });
    });
  }

  /**
   * Gauntlet — two lanes blocked simultaneously.
   * Player MUST be in the open lane or jump over laser!
   */
  _gauntlet() {
    const open  = Phaser.Math.Between(0, 2);
    const blocked = [0, 1, 2].filter(l => l !== open);
    blocked.forEach((lane, i) => {
      this.scene.time.delayedCall(i * 40, () => {
        if (!this.scene.isGameOver) this.scene._spawnObstacleInLane(lane);
      });
    });
  }

  /* ── Collectibles ── */

  _spawnStars() {
    const count = Phaser.Math.Between(1, 2);
    Phaser.Utils.Array.Shuffle([0, 1, 2]).slice(0, count).forEach((lane, i) => {
      this.scene.time.delayedCall(i * 240, () => {
        if (!this.scene.isGameOver) this.scene.spawnStar(lane);
      });
    });
  }

  _spawnPowerup() {
    const lane = Phaser.Math.Between(0, 2);
    const r = Math.random();
    const type = r < 0.50 ? 'rocket' : (r < 0.78 ? 'shield' : 'double');
    this.scene.spawnPowerup(lane, type);
  }
}
