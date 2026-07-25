import Phaser from 'phaser';

// BootScene: Generates high-fidelity game textures procedurally.
export default class BootScene extends Phaser.Scene {
  preload() {
    this.load.image('real_hero', 'assets/hero_astronaut.jpg');
    this.load.image('real_asteroid', 'assets/space_asteroid.jpg');
    this.load.image('real_laser', 'assets/laser_barrier.jpg');
    this.load.image('real_rocket', 'assets/rocket_ship.jpg');
    this.load.image('real_star', 'assets/gold_star.jpg');
  }

  create() {
    this._makeAstronaut();
    this._makeAsteroids();
    this._makeLaser();
    this._makeStar();
    this._makeShieldPU();
    this._makeDoublePU();
    this._makeRocketPU();
    this._makePlayerRocket();
    this._makeParticle();
    this.scene.start('SplashScene');
  }

  /* ─── High-Fidelity Astronaut (64×80 texture canvas) ─── */
  _makeAstronaut() {
    const g = this.make.graphics({ add: false });

    const draw = (pose) => {
      g.clear();
      const cx = 32;

      if (pose === 'slide') {
        // Prone slide pose
        g.fillStyle(0x00d4ff, 0.4); g.fillCircle(8, 62, 6);
        g.fillStyle(0xff8800, 0.6); g.fillCircle(14, 62, 4);

        g.fillStyle(0x050814, 0.4); g.fillEllipse(36, 68, 48, 12);
        g.fillStyle(0x94a3b8); g.fillRoundedRect(10, 54, 20, 10, 4);
        g.fillStyle(0xc0caf5); g.fillRoundedRect(16, 52, 20, 10, 4);
        g.fillStyle(0x1e293b); g.fillRoundedRect(6, 55, 10, 8, 2);

        g.fillStyle(0xe2e8f0); g.fillRoundedRect(24, 46, 26, 16, 5);
        g.fillStyle(0x64748b); g.fillRect(28, 48, 18, 4);
        g.fillStyle(0x00ffcc); g.fillRect(30, 54, 4, 4);

        g.fillStyle(0xf8fafc); g.fillCircle(46, 44, 15);
        g.fillStyle(0x0284c7); g.fillEllipse(50, 44, 10, 12);
        g.fillStyle(0x38bdf8); g.fillEllipse(51, 42, 6, 8);
        g.fillStyle(0xffffff, 0.8); g.fillCircle(52, 40, 2);

        g.fillStyle(0xc0caf5); g.fillRoundedRect(42, 54, 16, 8, 3);
        g.fillStyle(0x0284c7); g.fillCircle(56, 58, 4);
        return;
      }

      const isJump = pose === 'jump';
      const isRun2 = pose === 'run2';

      g.fillStyle(0x000000, 0.35);
      g.fillEllipse(cx, 74, isJump ? 24 : 36, 10);

      g.fillStyle(0x475569); g.fillRoundedRect(cx - 16, 22, 32, 28, 6);
      g.fillStyle(0x334155); g.fillRect(cx - 12, 26, 24, 6);

      g.fillStyle(0x1e293b);
      g.fillRect(cx - 13, 48, 8, 6);
      g.fillRect(cx + 5, 48, 8, 6);
      g.fillStyle(0x00f0ff);
      g.fillRect(cx - 11, 52, 4, 2);
      g.fillRect(cx + 7, 52, 4, 2);

      g.fillStyle(0xf8fafc); g.fillCircle(cx, 20, 17);
      g.fillStyle(0xcbd5e1); g.fillCircle(cx - 6, 14, 6);

      g.fillStyle(0x0f172a); g.fillCircle(cx, 20, 13);
      g.fillStyle(0x0369a1); g.fillCircle(cx, 19, 11);
      g.fillStyle(0x38bdf8); g.fillEllipse(cx + 3, 16, 7, 5);
      g.fillStyle(0xffffff, 0.85); g.fillCircle(cx + 4, 15, 2.5);

      g.fillStyle(0xe2e8f0); g.fillRoundedRect(cx - 15, 34, 30, 24, 6);
      g.fillStyle(0x1e293b); g.fillRoundedRect(cx - 9, 38, 18, 12, 3);
      g.fillStyle(0x10b981); g.fillRect(cx - 6, 41, 4, 3);
      g.fillStyle(0xf59e0b); g.fillRect(cx, 41, 4, 3);
      g.fillStyle(0xef4444); g.fillRect(cx + 3, 46, 3, 2);

      g.fillStyle(0x2563eb); g.fillRect(cx - 13, 36, 4, 16);

      g.fillStyle(0xf8fafc);
      g.fillCircle(cx - 17, 36, 6);
      g.fillCircle(cx + 17, 36, 6);

      if (isJump) {
        g.fillStyle(0xc0caf5);
        g.fillRoundedRect(cx - 24, 28, 8, 18, 3);
        g.fillRoundedRect(cx + 16, 28, 8, 18, 3);
        g.fillStyle(0x0284c7);
        g.fillCircle(cx - 20, 46, 4);
        g.fillCircle(cx + 20, 46, 4);
      } else {
        const laY = isRun2 ? 38 : 34;
        const raY = isRun2 ? 34 : 38;
        g.fillStyle(0xc0caf5);
        g.fillRoundedRect(cx - 23, laY, 7, 17, 3);
        g.fillRoundedRect(cx + 16, raY, 7, 17, 3);
        g.fillStyle(0x0284c7);
        g.fillCircle(cx - 19.5, laY + 16, 4);
        g.fillCircle(cx + 19.5, raY + 16, 4);
      }

      g.fillStyle(0x475569); g.fillRoundedRect(cx - 13, 56, 26, 6, 2);

      if (isJump) {
        g.fillStyle(0xc0caf5);
        g.fillRoundedRect(cx - 13, 58, 10, 14, 3);
        g.fillRoundedRect(cx + 3, 58, 10, 14, 3);
        g.fillStyle(0x1e293b);
        g.fillRoundedRect(cx - 14, 68, 11, 7, 2);
        g.fillRoundedRect(cx + 3, 68, 11, 7, 2);
        g.fillStyle(0x00f0ff);
        g.fillRect(cx - 13, 74, 9, 2);
        g.fillRect(cx + 4, 74, 9, 2);
      } else {
        const llH = isRun2 ? 15 : 18;
        const rlH = isRun2 ? 18 : 15;
        const llY = 60; const rlY = 60;

        g.fillStyle(0xc0caf5);
        g.fillRoundedRect(cx - 13, llY, 10, llH, 3);
        g.fillRoundedRect(cx + 3, rlY, 10, rlH, 3);

        g.fillStyle(0x1e293b);
        g.fillRoundedRect(cx - 14, llY + llH - 2, 12, 7, 2);
        g.fillRoundedRect(cx + 2, rlY + rlH - 2, 12, 7, 2);

        g.fillStyle(0x0284c7);
        g.fillRect(cx - 13, llY + llH + 3, 10, 2);
        g.fillRect(cx + 3, rlY + rlH + 3, 10, 2);
      }
    };

    draw('run1'); g.generateTexture('player_run1', 64, 80);
    draw('run2'); g.generateTexture('player_run2', 64, 80);
    draw('jump'); g.generateTexture('player_jump', 64, 80);
    draw('slide'); g.generateTexture('player_slide', 64, 80);
    g.destroy();
  }

  /* ─── Spaceship Flight Mode Texture (80x80) ─── */
  _makePlayerRocket() {
    const g = this.make.graphics({ add: false });
    const cx = 40, cy = 40;

    // Main sleek spaceship body
    g.fillStyle(0xef4444);
    g.fillTriangle(cx, cy - 35, cx - 22, cy + 25, cx + 22, cy + 25);
    g.fillStyle(0xf8fafc);
    g.fillTriangle(cx, cy - 28, cx - 14, cy + 22, cx + 14, cy + 22);

    // Glowing cyan cockpit canopy
    g.fillStyle(0x0284c7); g.fillCircle(cx, cy - 4, 12);
    g.fillStyle(0x38bdf8); g.fillCircle(cx + 2, cy - 6, 6);
    g.fillStyle(0xffffff, 0.9); g.fillCircle(cx + 3, cy - 7, 2.5);

    // Wing blasters
    g.fillStyle(0x334155);
    g.fillRect(cx - 28, cy + 6, 8, 20);
    g.fillRect(cx + 20, cy + 6, 8, 20);
    g.fillStyle(0x00f0ff);
    g.fillRect(cx - 26, cy + 4, 4, 3);
    g.fillRect(cx + 22, cy + 4, 4, 3);

    // Rocket booster nozzles
    g.fillStyle(0x1e293b);
    g.fillRect(cx - 10, cy + 22, 20, 8);

    g.generateTexture('player_rocket', 80, 80);
    g.destroy();
  }

  /* ─── Asteroids ─── */
  _makeAsteroids() {
    const drawAst = (key, r) => {
      const g = this.make.graphics({ add: false });
      const s = r * 2 + 8;
      const cx = s / 2, cy = s / 2;

      g.fillStyle(0x000000, 0.4); g.fillCircle(cx + 2, cy + 3, r + 2);
      g.fillStyle(0x3b2716); g.fillCircle(cx, cy, r);
      g.fillStyle(0x6b4c30); g.fillCircle(cx - r * 0.2, cy - r * 0.2, r * 0.72);
      g.fillStyle(0x8c6845); g.fillCircle(cx - r * 0.3, cy - r * 0.3, r * 0.45);

      g.fillStyle(0x1f1308);
      g.fillCircle(cx + r * 0.1, cy + r * 0.2, r * 0.28);
      g.fillCircle(cx - r * 0.4, cy + r * 0.3, r * 0.22);
      g.fillCircle(cx + r * 0.35, cy - r * 0.35, r * 0.20);

      g.fillStyle(0xff5500, 0.8);
      g.fillCircle(cx + r * 0.1, cy + r * 0.2, r * 0.12);
      g.fillCircle(cx - r * 0.4, cy + r * 0.3, r * 0.08);

      g.fillStyle(0xffaa00, 0.9);
      g.fillCircle(cx + r * 0.1, cy + r * 0.2, r * 0.05);

      g.lineStyle(1.5, 0x9c7a53, 0.7);
      g.strokeCircle(cx - r * 0.45, cy + r * 0.25, r * 0.22);
      g.strokeCircle(cx + r * 0.05, cy + r * 0.15, r * 0.28);

      g.generateTexture(key, s, s);
      g.destroy();
    };
    drawAst('asteroid_sm', 18);
    drawAst('asteroid_lg', 28);
  }

  /* ─── Laser beam + emitter post ─── */
  _makeLaser() {
    let g = this.make.graphics({ add: false });
    g.fillStyle(0xff0055, 0.25); g.fillRect(0, 0, 100, 16);
    g.fillStyle(0xff1100, 0.6);  g.fillRect(0, 3, 100, 10);
    g.fillStyle(0xff4400);       g.fillRect(0, 5, 100, 6);
    g.fillStyle(0xffffff, 0.95); g.fillRect(0, 7, 100, 2);
    g.generateTexture('laser_beam', 100, 16);
    g.destroy();

    g = this.make.graphics({ add: false });
    g.fillStyle(0x0f172a); g.fillRoundedRect(3, 12, 18, 36, 4);
    g.fillStyle(0x334155); g.fillRoundedRect(1, 34, 22, 12, 3);
    g.fillStyle(0x475569); g.fillRect(5, 16, 14, 4);

    g.fillStyle(0xff0044, 0.4);  g.fillCircle(12, 10, 10);
    g.fillStyle(0xff2200, 0.8);  g.fillCircle(12, 10, 7);
    g.fillStyle(0xff8800);       g.fillCircle(12, 10, 4);
    g.fillStyle(0xffffff, 0.9);  g.fillCircle(12, 10, 2);

    g.generateTexture('laser_post', 24, 50);
    g.destroy();
  }

  /* ─── Star collectible (36×36) ─── */
  _makeStar() {
    const g = this.make.graphics({ add: false });
    const cx = 18, cy = 18;
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI / 5) - Math.PI / 2;
      const r = i % 2 === 0 ? 16 : 7;
      pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }
    g.fillStyle(0xffaa00, 0.4); g.fillCircle(cx, cy, 17);
    g.fillStyle(0xf59e0b);      g.fillPoints(pts, true);
    const hi = [];
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI / 5) - Math.PI / 2;
      const r = i % 2 === 0 ? 10 : 4;
      hi.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }
    g.fillStyle(0xfde047);      g.fillPoints(hi, true);
    g.fillStyle(0xffffff, 0.95); g.fillCircle(cx, cy, 3);
    g.generateTexture('star', 36, 36);
    g.destroy();
  }

  /* ─── Shield pickup (36×36) ─── */
  _makeShieldPU() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x0284c7, 0.3);  g.fillCircle(18, 18, 17);
    g.fillStyle(0x0284c7, 0.7);  g.fillCircle(18, 18, 13);
    g.fillStyle(0x38bdf8);       g.fillCircle(18, 18, 8);
    g.fillStyle(0xffffff, 0.9);  g.fillCircle(18, 18, 3);
    g.lineStyle(2, 0xbae6fd, 0.95); g.strokeCircle(18, 18, 15);
    g.generateTexture('shield_pu', 36, 36);
    g.destroy();
  }

  /* ─── Double-score pickup (36×36) ─── */
  _makeDoublePU() {
    const g = this.make.graphics({ add: false });
    const pts = [{ x:18,y:2 },{ x:34,y:18 },{ x:18,y:34 },{ x:2,y:18 }];
    g.fillStyle(0x06b6d4, 0.35); g.fillPoints(pts, true);
    g.fillStyle(0x22d3ee, 0.8);
    const i2 = [{ x:18,y:7 },{ x:25,y:16 },{ x:18,y:25 },{ x:7,y:16 }];
    g.fillPoints(i2, true);
    g.fillStyle(0xffffff, 0.95);
    const i3 = [{ x:18,y:11 },{ x:21,y:16 },{ x:18,y:21 },{ x:11,y:16 }];
    g.fillPoints(i3, true);
    g.lineStyle(2, 0xa5f3fc, 0.9); g.strokePoints(pts, true);
    g.generateTexture('double_pu', 36, 36);
    g.destroy();
  }

  /* ─── Rocket Equipment pickup (36×36) ─── */
  _makeRocketPU() {
    const g = this.make.graphics({ add: false });
    const cx = 18, cy = 18;

    g.fillStyle(0xef4444, 0.35); g.fillCircle(cx, cy, 17);
    g.fillStyle(0xef4444, 0.9);
    g.fillTriangle(cx, cy - 14, cx - 9, cy + 8, cx + 9, cy + 8);
    g.fillStyle(0xf8fafc);
    g.fillTriangle(cx, cy - 10, cx - 5, cy + 6, cx + 5, cy + 6);
    g.fillStyle(0x0284c7); g.fillCircle(cx, cy - 2, 4);
    g.fillStyle(0xffaa00);
    g.fillTriangle(cx - 5, cy + 8, cx + 5, cy + 8, cx, cy + 15);

    g.lineStyle(2, 0xfca5a5, 0.9); g.strokeCircle(cx, cy, 15);
    g.generateTexture('rocket_pu', 36, 36);
    g.destroy();
  }

  /* ─── Generic particle (8×8) ─── */
  _makeParticle() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xffffff); g.fillCircle(4, 4, 4);
    g.generateTexture('particle', 8, 8);
    g.destroy();
  }
}
