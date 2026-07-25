import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOverScene' }); }

  init(data) {
    this.finalScore = data.score || 0;
    this.bestScore  = data.best  || 0;

    const scores = JSON.parse(localStorage.getItem('dod_scores') || '[]');
    scores.push(this.finalScore);
    scores.sort((a, b) => b - a);
    localStorage.setItem('dod_scores', JSON.stringify(scores.slice(0, 10)));
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    this.add.rectangle(W / 2, H / 2, W, H, 0x020510);
    for (let i = 0; i < 140; i++) {
      this.add.circle(
        Phaser.Math.Between(0, W), Phaser.Math.Between(0, H),
        Phaser.Math.FloatBetween(0.4, 1.8), 0xffffff,
        Phaser.Math.FloatBetween(0.1, 0.7)
      );
    }

    // Red screen vignette
    this.add.rectangle(W / 2, H / 2, W, H, 0xff0000, 0.08);

    // ── Card ──
    const cardW = Math.min(W * 0.85, 360);
    const cardH = 380;
    const cardX = W / 2;
    const cardY = H / 2;

    const cardGfx = this.add.graphics().setDepth(1);
    cardGfx.fillStyle(0x07071e, 0.96);
    cardGfx.fillRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 12);
    cardGfx.lineStyle(2, 0xff1144, 0.9);
    cardGfx.strokeRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 12);

    this.add.text(cardX, cardY - 130, 'GAME OVER', {
      fontFamily: 'monospace', fontSize: Math.min(W * 0.07, 40) + 'px', fontStyle: 'bold',
      color: '#ff1144',
      stroke: '#550011', strokeThickness: 4,
      shadow: { x: 0, y: 0, color: '#ff0033', blur: 22, fill: true }
    }).setOrigin(0.5).setDepth(2);

    // Divider
    const dg = this.add.graphics().setDepth(2);
    dg.lineStyle(1, 0x224466);
    dg.lineBetween(cardX - cardW * 0.4, cardY - 60, cardX + cardW * 0.4, cardY - 60);
    dg.lineBetween(cardX, cardY - 60, cardX, cardY + 50);

    // Labels
    this.add.text(cardX - cardW * 0.22, cardY - 40, 'SCORE', {
      fontFamily: 'monospace', fontSize: '13px', color: '#64748b'
    }).setOrigin(0.5).setDepth(2);

    this.add.text(cardX + cardW * 0.22, cardY - 40, 'BEST', {
      fontFamily: 'monospace', fontSize: '13px', color: '#64748b'
    }).setOrigin(0.5).setDepth(2);

    // Values
    this.add.text(cardX - cardW * 0.22, cardY, this.finalScore.toString(), {
      fontFamily: 'monospace', fontSize: '32px', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5).setDepth(2);

    this.add.text(cardX + cardW * 0.22, cardY, this.bestScore.toString(), {
      fontFamily: 'monospace', fontSize: '32px', fontStyle: 'bold', color: '#ffd700'
    }).setOrigin(0.5).setDepth(2);

    if (this.finalScore >= this.bestScore && this.finalScore > 0) {
      this.add.text(cardX + cardW * 0.22, cardY + 32, '★ NEW BEST', {
        fontFamily: 'monospace', fontSize: '11px', color: '#ffd700'
      }).setOrigin(0.5).setDepth(2);
    }

    // Buttons
    this._btn(cardX - 70, cardY + 110, '🏠', 'MENU',  () => this.scene.start('MenuScene'));
    this._btn(cardX + 70, cardY + 110, '▶', 'RETRY', () => this.scene.start('GameScene'));
  }

  _btn(x, y, icon, label, cb) {
    const gfx = this.add.graphics().setDepth(2);
    const draw = (fill) => {
      gfx.clear();
      gfx.fillStyle(fill, 1); gfx.fillRoundedRect(x - 55, y - 36, 110, 72, 8);
      gfx.lineStyle(1.5, 0x00d4ff, 0.85); gfx.strokeRoundedRect(x - 55, y - 36, 110, 72, 8);
    };
    draw(0x0c0c28);

    this.add.text(x, y - 12, icon,  { fontSize: '24px' }).setOrigin(0.5).setDepth(3);
    this.add.text(x, y + 16, label, {
      fontFamily: 'monospace', fontSize: '13px', color: '#8888aa'
    }).setOrigin(0.5).setDepth(3);

    const zone = this.add.zone(x, y, 110, 72).setInteractive({ useHandCursor: true }).setDepth(3);
    zone.on('pointerover', () => draw(0x002244));
    zone.on('pointerout',  () => draw(0x0c0c28));
    zone.on('pointerdown', () => { draw(0x004466); this.time.delayedCall(120, cb); });
  }
}
