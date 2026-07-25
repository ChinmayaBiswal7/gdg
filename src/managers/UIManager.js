// UIManager — owns all HUD elements with responsive dynamic layout across screen width.
// Depth 30-39 reserved for HUD; 40+ for overlays.
export default class UIManager {
  constructor(scene) {
    this.scene = scene;
    const W = scene.scale.width;
    const H = scene.scale.height;

    const barGfx = scene.add.graphics().setDepth(30);

    // ── 1. SCORE CARD (Top-Left: x=20, w=120) ──
    barGfx.fillStyle(0x0f172a, 0.85);
    barGfx.fillRoundedRect(20, 16, 120, 44, 10);
    barGfx.lineStyle(1.5, 0xfacc15, 0.7);
    barGfx.strokeRoundedRect(20, 16, 120, 44, 10);

    scene.add.text(28, 27, '⭐', { fontSize: '18px' }).setDepth(31);
    this._scoreTxt = scene.add.text(54, 25, '0', {
      fontFamily: 'monospace', fontSize: '22px',
      fontStyle: 'bold', color: '#facc15'
    }).setDepth(31);

    // ── 2. MULTIPLIER PILL (Top-Left next to Score: x=148, w=54) ──
    this._multBg = scene.add.graphics().setDepth(30);
    this._drawMultBg(1);
    this._multTxt = scene.add.text(160, 26, 'x1', {
      fontFamily: 'monospace', fontSize: '17px', fontStyle: 'bold', color: '#00ff88'
    }).setDepth(31);

    // ── 3. HEALTH LIVES CARD (Centered at top W / 2) ──
    const livesW = 110;
    const livesX = W / 2 - livesW / 2;
    barGfx.fillStyle(0x0f172a, 0.85);
    barGfx.fillRoundedRect(livesX, 16, livesW, 44, 10);
    barGfx.lineStyle(1.5, 0xef4444, 0.6);
    barGfx.strokeRoundedRect(livesX, 16, livesW, 44, 10);

    this._hearts = [];
    for (let i = 0; i < 3; i++) {
      this._hearts.push(
        scene.add.text(livesX + 12 + i * 30, 25, '♥', {
          fontSize: '20px', color: '#ff4466'
        }).setDepth(31)
      );
    }

    // ── 4. SHIELD BADGE PILL (Top-Right next to Lives) ──
    const shieldX = W / 2 + livesW / 2 + 12;
    this._shieldPill = scene.add.graphics().setDepth(30);
    this._shieldIcon = scene.add.text(shieldX + 10, 25, '🛡️', { fontSize: '18px' })
      .setDepth(31).setVisible(false);

    // ── 5. PAUSE BUTTON (Top-Right: x = W - 64) ──
    const pauseX = W - 64;
    barGfx.fillStyle(0x0f172a, 0.85);
    barGfx.fillRoundedRect(pauseX, 16, 44, 44, 10);
    barGfx.lineStyle(1.5, 0x38bdf8, 0.8);
    barGfx.strokeRoundedRect(pauseX, 16, 44, 44, 10);

    const pauseBtn = scene.add.text(pauseX + 11, 24, '⏸', {
      fontSize: '20px', color: '#38bdf8'
    }).setDepth(31).setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerdown', () => scene.togglePause());

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
    this._multBg.fillRoundedRect(148, 16, 54, 44, 10);
    this._multBg.lineStyle(1.5, mult > 1 ? 0x22d3ee : 0x475569, 0.8);
    this._multBg.strokeRoundedRect(148, 16, 54, 44, 10);
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
    const W = this.scene.scale.width;
    const shieldX = W / 2 + 110 / 2 + 12;
    this._shieldIcon.setVisible(active);
    this._shieldPill.clear();
    if (active) {
      this._shieldPill.fillStyle(0x0284c7, 0.85);
      this._shieldPill.fillRoundedRect(shieldX, 16, 44, 44, 10);
      this._shieldPill.lineStyle(1.5, 0x38bdf8, 0.9);
      this._shieldPill.strokeRoundedRect(shieldX, 16, 44, 44, 10);
    }
  }

  setPaused(paused) {
    [this._pauseRect, this._pauseTxt, this._pauseSub].forEach(o => o.setVisible(paused));
  }
}
