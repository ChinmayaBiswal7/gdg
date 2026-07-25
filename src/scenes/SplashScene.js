import Phaser from 'phaser';

export default class SplashScene extends Phaser.Scene {
  constructor() { super({ key: 'SplashScene' }); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Deep space dark background
    this.add.rectangle(W / 2, H / 2, W, H, 0x020410);

    // ── Warp Speed Starfield ──
    this._stars = [];
    for (let i = 0; i < 180; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        Phaser.Math.FloatBetween(0.5, 2.2),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.9)
      );
      star._speed = Phaser.Math.FloatBetween(1.5, 6.0);
      this._stars.push(star);
    }

    const logoY = H * 0.36;
    const fontSize = Math.min(W * 0.075, 56);

    // ── Single Title Container with Exact Pixel Measurement ──
    // Word 1: DEPLOY (Flies in from Left)
    const w1 = this.add.text(-300, logoY, 'DEPLOY', {
      fontFamily: 'monospace, sans-serif',
      fontSize: fontSize + 'px',
      fontStyle: '900',
      color: '#facc15',
      stroke: '#000000',
      strokeThickness: 8,
      shadow: { x: 0, y: 5, color: '#78350f', blur: 12, fill: true }
    }).setOrigin(0.5);

    // Word 2: OR (Drops from Top)
    const w2 = this.add.text(W / 2, -150, 'OR', {
      fontFamily: 'monospace, sans-serif',
      fontSize: fontSize + 'px',
      fontStyle: '900',
      color: '#fbbf24',
      stroke: '#000000',
      strokeThickness: 8,
      shadow: { x: 0, y: 5, color: '#78350f', blur: 12, fill: true }
    }).setOrigin(0.5);

    // Word 3: DIE (Slams in from Right)
    const w3 = this.add.text(W + 300, logoY, 'DIE', {
      fontFamily: 'monospace, sans-serif',
      fontSize: fontSize + 'px',
      fontStyle: '900',
      color: '#ef4444',
      stroke: '#000000',
      strokeThickness: 8,
      shadow: { x: 0, y: 5, color: '#450a0a', blur: 12, fill: true }
    }).setOrigin(0.5);

    // Compute EXACT assembled positions with zero overlap
    const gap = Math.min(W * 0.03, 24);
    const totalW = w1.width + gap + w2.width + gap + w3.width;
    const startX = W / 2 - totalW / 2;

    const targetX1 = startX + w1.width / 2;
    const targetX2 = startX + w1.width + gap + w2.width / 2;
    const targetX3 = startX + w1.width + gap + w2.width + gap + w3.width / 2;

    // ── Kinetic Word Assembly Animations ──
    // 1. DEPLOY slides in from left
    this.tweens.add({
      targets: w1,
      x: targetX1,
      duration: 650,
      ease: 'Cubic.easeOut'
    });

    // 2. OR drops down from top
    this.tweens.add({
      targets: w2,
      x: targetX2,
      y: logoY,
      duration: 700,
      delay: 150,
      ease: 'Back.easeOut'
    });

    // 3. DIE slams in from right
    this.tweens.add({
      targets: w3,
      x: targetX3,
      duration: 650,
      delay: 300,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        // Impact flash & pulse on assembly complete!
        this.cameras.main.shake(180, 0.008);
        this._burstImpact(W / 2, logoY);
      }
    });

    // Subtitle text: "Build beyond Boundaries. Discover beyond Earth!"
    const sub = this.add.text(W / 2, logoY + H * 0.16, 'Build beyond Boundaries.\nDiscover beyond Earth!', {
      fontFamily: 'sans-serif, monospace',
      fontSize: Math.min(W * 0.034, 22) + 'px',
      fontStyle: '600',
      color: '#f8fafc',
      align: 'center',
      lineSpacing: 10,
      shadow: { x: 0, y: 2, color: '#000000', blur: 10, fill: true }
    }).setOrigin(0.5).setAlpha(0);

    // Fade-in Subtitle
    this.tweens.add({
      targets: sub,
      alpha: 1,
      y: logoY + H * 0.14,
      duration: 700,
      delay: 850,
      ease: 'Cubic.easeOut'
    });

    // ── Energy Loading Bar → Play Button ──
    const barW = Math.min(W * 0.65, 360);
    const barH = 10;
    const barY = H * 0.78;

    const track = this.add.graphics();
    track.fillStyle(0x1e293b, 0.8);
    track.fillRoundedRect(W / 2 - barW / 2, barY, barW, barH, 5);
    track.lineStyle(1.5, 0xfacc15, 0.6);
    track.strokeRoundedRect(W / 2 - barW / 2, barY, barW, barH, 5);

    const fillGfx = this.add.graphics();
    const loadText = this.add.text(W / 2, barY + 24, 'INITIALIZING SYSTEM...', {
      fontFamily: 'monospace', fontSize: '13px', color: '#94a3b8', letterSpacing: 2
    }).setOrigin(0.5);

    let progress = 0;

    this.time.addEvent({
      delay: 25,
      repeat: 40,
      callback: () => {
        progress += 0.025;
        fillGfx.clear();
        fillGfx.fillStyle(0xfacc15, 1);
        fillGfx.fillRoundedRect(W / 2 - barW / 2 + 2, barY + 2, Math.max(0, (barW - 4) * Math.min(progress, 1)), barH - 4, 3);

        if (progress >= 1.0) {
          // Fade out loading bar and reveal ▶ PLAY GAME button!
          this.tweens.add({
            targets: [track, fillGfx, loadText],
            alpha: 0,
            duration: 300,
            onComplete: () => {
              track.destroy(); fillGfx.destroy(); loadText.destroy();
              this._showPlayButton(W / 2, barY);
            }
          });
        }
      }
    });

    // Key shortcut to start game
    this.input.keyboard.once('keydown-SPACE', () => this._launchGame());
    this.input.keyboard.once('keydown-ENTER', () => this._launchGame());
  }

  /* ── Impact burst particles when words assemble ── */
  _burstImpact(x, y) {
    for (let i = 0; i < 24; i++) {
      const p = this.add.circle(
        x + (Math.random() * 80 - 40),
        y + (Math.random() * 20 - 10),
        Phaser.Math.FloatBetween(2, 5),
        Math.random() < 0.5 ? 0xfacc15 : 0xef4444,
        0.9
      );
      const angle = Math.random() * Math.PI * 2;
      const dist  = Phaser.Math.Between(40, 110);
      this.tweens.add({
        targets: p,
        x: p.x + Math.cos(angle) * dist,
        y: p.y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.1,
        duration: 500,
        ease: 'Cubic.Out',
        onComplete: () => p.destroy()
      });
    }
  }

  /* ── Glowing ▶ PLAY GAME Button ── */
  _showPlayButton(x, y) {
    const BW = Math.min(this.scale.width * 0.7, 300), BH = 54;
    const lx = x - BW / 2, ty = y - BH / 2;

    const btnGfx = this.add.graphics();
    const draw = (fillColor, glowColor) => {
      btnGfx.clear();
      btnGfx.fillStyle(fillColor, 1);
      btnGfx.fillRoundedRect(lx, ty, BW, BH, 10);
      btnGfx.lineStyle(2.5, glowColor, 1);
      btnGfx.strokeRoundedRect(lx, ty, BW, BH, 10);
    };
    draw(0xf59e0b, 0xfde047);

    const txt = this.add.text(x, y, '▶   PLAY GAME', {
      fontFamily: 'monospace, sans-serif',
      fontSize: '22px',
      fontStyle: '900',
      color: '#0f172a'
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, BW, BH).setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => draw(0xfacc15, 0xffffff));
    zone.on('pointerout',  () => draw(0xf59e0b, 0xfde047));
    zone.on('pointerdown', () => {
      if (!this.scale.isFullscreen) {
        try { this.scale.startFullscreen(); } catch (e) {}
      }
      this._launchGame();
    });

    // Pulse breathing on play button
    this.tweens.add({
      targets: [txt, btnGfx],
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  _launchGame() {
    this.cameras.main.fade(300, 2, 5, 16);
    this.time.delayedCall(300, () => {
      this.scene.start('MenuScene');
    });
  }

  update(time, delta) {
    if (!this._stars) return;
    const dt = delta / 1000;
    const W = this.scale.width;
    const H = this.scale.height;

    this._stars.forEach(s => {
      s.y += s._speed * 60 * dt;
      if (s.y > H) {
        s.y = 0;
        s.x = Phaser.Math.Between(0, W);
      }
    });
  }
}
