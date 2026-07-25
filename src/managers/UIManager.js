// UIManager — owns all HUD elements with responsive dynamic layout across screen width.
// Depth 30-39 reserved for HUD; 40+ for overlays.
export default class UIManager {
  constructor(scene) {
    this.scene = scene;
    const W = scene.scale.width;
    const H = scene.scale.height;

    const isMobile = W < 520;
    const barGfx = scene.add.graphics().setDepth(30);

    // ── 1. SCORE CARD (Top-Left) ──
    const scoreW = isMobile ? 88 : 120;
    const scoreX = 10;
    barGfx.fillStyle(0x0f172a, 0.85);
    barGfx.fillRoundedRect(scoreX, 12, scoreW, 40, 8);
    barGfx.lineStyle(1.5, 0xfacc15, 0.7);
    barGfx.strokeRoundedRect(scoreX, 12, scoreW, 40, 8);

    scene.add.text(scoreX + 6, 21, '⭐', { fontSize: isMobile ? '14px' : '18px' }).setDepth(31);
    this._scoreTxt = scene.add.text(scoreX + (isMobile ? 26 : 32), 20, '0', {
      fontFamily: 'monospace', fontSize: isMobile ? '16px' : '22px',
      fontStyle: 'bold', color: '#facc15'
    }).setDepth(31);

    // ── 2. MULTIPLIER PILL ──
    const multX = scoreX + scoreW + 6;
    const multW = isMobile ? 38 : 50;
    this._multX = multX;
    this._multW = multW;
    this._isMobile = isMobile;
    this._multBg = scene.add.graphics().setDepth(30);
    this._drawMultBg(1);
    this._multTxt = scene.add.text(multX + (isMobile ? 7 : 10), 22, 'x1', {
      fontFamily: 'monospace', fontSize: isMobile ? '14px' : '17px', fontStyle: 'bold', color: '#00ff88'
    }).setDepth(31);

    // ── 3. PAUSE BUTTON (Top-Right) ──
    const pauseX = W - (isMobile ? 48 : 56);
    barGfx.fillStyle(0x0f172a, 0.85);
    barGfx.fillRoundedRect(pauseX, 12, 40, 40, 8);
    barGfx.lineStyle(1.5, 0x38bdf8, 0.8);
    barGfx.strokeRoundedRect(pauseX, 12, 40, 40, 8);

    const pauseBtn = scene.add.text(pauseX + 10, 20, '⏸', {
      fontSize: '18px', color: '#38bdf8'
    }).setDepth(31).setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerdown', () => scene.togglePause());

    // ── 4. HEALTH LIVES CARD (Centered in remaining gap) ──
    const availLeft = multX + multW + 6;
    const availRight = pauseX - 6;
    const centerAreaX = (availLeft + availRight) / 2;

    const livesW = isMobile ? 86 : 106;
    const livesX = centerAreaX - livesW / 2;
    barGfx.fillStyle(0x0f172a, 0.85);
    barGfx.fillRoundedRect(livesX, 12, livesW, 40, 8);
    barGfx.lineStyle(1.5, 0xef4444, 0.6);
    barGfx.strokeRoundedRect(livesX, 12, livesW, 40, 8);

    this._hearts = [];
    const heartSpacing = isMobile ? 22 : 28;
    const heartStart = livesX + (isMobile ? 10 : 12);
    for (let i = 0; i < 3; i++) {
      this._hearts.push(
        scene.add.text(heartStart + i * heartSpacing, 20, '♥', {
          fontSize: isMobile ? '16px' : '20px', color: '#ff4466'
        }).setDepth(31)
      );
    }

    // ── 5. SHIELD BADGE PILL ──
    const shieldX = pauseX - 48;
    this._shieldX = shieldX;
    this._shieldPill = scene.add.graphics().setDepth(30);
    this._shieldIcon = scene.add.text(shieldX + 10, 20, '🛡️', { fontSize: '18px' })
      .setDepth(31).setVisible(false);

    // ── Pause Overlay ──
    this._pauseRect = scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75)
      .setDepth(40).setVisible(false);
    this._pauseTxt = scene.add.text(W / 2, H * 0.45, 'PAUSED', {
      fontFamily: 'monospace', fontSize: '48px', fontStyle: 'bold',
      color: '#00d4ff', stroke: '#001a22', strokeThickness: 4
    }).setOrigin(0.5).setDepth(41).setVisible(false);
    this._pauseSub = scene.add.text(W / 2, H * 0.53, 'Press  P  or  ESC  or Tap to Resume', {
      fontFamily: 'monospace', fontSize: '16px', color: '#94a3b8'
    }).setOrigin(0.5).setDepth(41).setVisible(false);
  }

  _drawMultBg(mult) {
    this._multBg.clear();
    const color = mult > 1 ? 0x06b6d4 : 0x1e293b;
    this._multBg.fillStyle(color, 0.85);
    this._multBg.fillRoundedRect(this._multX, 12, this._multW, 40, 8);
    this._multBg.lineStyle(1.5, mult > 1 ? 0x22d3ee : 0x475569, 0.8);
    this._multBg.strokeRoundedRect(this._multX, 12, this._multW, 40, 8);
  }

  updateScore(score) {
    this._scoreTxt.setText(score.toString());
  }

  updateMultiplier(mult) {
    this._drawMultBg(mult);
    this._multTxt.setText(`x${mult}`);
    this._multTxt.setColor(mult > 1 ? '#ffffff' : '#00ff88');
  }

  updateLives(lives) {
    this._hearts.forEach((h, i) => h.setAlpha(i < lives ? 1 : 0.18));
  }

  showShield(active) {
    this._shieldIcon.setVisible(active);
    this._shieldPill.clear();
    if (active) {
      this._shieldPill.fillStyle(0x0284c7, 0.85);
      this._shieldPill.fillRoundedRect(this._shieldX, 12, 40, 40, 8);
      this._shieldPill.lineStyle(1.5, 0x38bdf8, 0.9);
      this._shieldPill.strokeRoundedRect(this._shieldX, 12, 40, 40, 8);
    }
  }

  setPaused(paused) {
    [this._pauseRect, this._pauseTxt, this._pauseSub].forEach(o => o.setVisible(paused));
  }
}
