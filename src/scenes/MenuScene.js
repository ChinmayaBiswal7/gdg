import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // ── Fullscreen Background ──
    this.add.rectangle(W / 2, H / 2, W, H, 0x020510);
    this._buildStarfield();
    this._buildPlanets();

    // ── Title ──
    const titleY = H * 0.24;
    const t1 = this.add.text(W / 2, titleY, 'DEPLOY', {
      fontFamily: 'monospace', fontSize: Math.min(W * 0.08, 62) + 'px', fontStyle: 'bold',
      color: '#00d4ff',
      stroke: '#003344', strokeThickness: 4,
      shadow: { x: 0, y: 0, color: '#00d4ff', blur: 28, fill: true }
    }).setOrigin(0.5);

    const t2 = this.add.text(W / 2, titleY + 68, 'OR DIE', {
      fontFamily: 'monospace', fontSize: Math.min(W * 0.08, 62) + 'px', fontStyle: 'bold',
      color: '#ff1155',
      stroke: '#330011', strokeThickness: 4,
      shadow: { x: 0, y: 0, color: '#ff1155', blur: 28, fill: true }
    }).setOrigin(0.5);

    this.add.text(W / 2, titleY + 130, '— ENDLESS SPACE RUNNER —', {
      fontFamily: 'monospace', fontSize: '14px', color: '#64748b',
      letterSpacing: 2
    }).setOrigin(0.5);

    // Pulsing breath on title
    this.tweens.add({
      targets: [t1, t2], scaleX: 1.025, scaleY: 1.025,
      duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // ── Floating astronaut ──
    this._buildMenuAstronaut(W / 2, H * 0.52);

    // ── Buttons ──
    const btnY = H * 0.68;
    this._btn(W / 2, btnY,       '▶   START',       0x00d4ff, () => this.scene.start('GameScene'));
    this._btn(W / 2, btnY + 62,  '🏆  LEADERBOARD', 0xffd700, () => this._showLeaderboard());
    this._btn(W / 2, btnY + 124, '⚙   SETTINGS',    0x8888aa, () => this._showSettings());

    // ── Best score ──
    const best = localStorage.getItem('dod_best') || '0';
    this.add.text(W / 2, H * 0.94, `BEST   ${best}`, {
      fontFamily: 'monospace', fontSize: '15px', color: '#ffd700'
    }).setOrigin(0.5);

    // ── Scrolling star layer ──
    this._scrollStars = [];
    this._scrollSpeeds = [];
    for (let i = 0; i < 90; i++) {
      this._scrollStars.push(this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        Phaser.Math.FloatBetween(0.4, 1.8),
        0xffffff, Phaser.Math.FloatBetween(0.2, 0.8)
      ));
      this._scrollSpeeds.push(Phaser.Math.FloatBetween(0.2, 1.1));
    }
  }

  /* ─── Background helpers ─── */

  _buildStarfield() {
    const W = this.scale.width;
    const H = this.scale.height;
    for (let i = 0; i < 180; i++) {
      this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        Phaser.Math.FloatBetween(0.3, 2),
        0xffffff, Phaser.Math.FloatBetween(0.1, 0.8)
      );
    }
  }

  _buildPlanets() {
    const W = this.scale.width;
    const H = this.scale.height;
    const g = this.add.graphics();
    g.fillStyle(0x5b21b6, 0.55); g.fillCircle(W * 0.15, H * 0.15, 50);
    g.fillStyle(0x7c3aed, 0.2);  g.fillCircle(W * 0.15 - 14, H * 0.15 - 16, 35);
    g.fillStyle(0x1d4ed8, 0.48); g.fillCircle(W * 0.85, H * 0.2, 32);
    g.lineStyle(4, 0x3b82f6, 0.3); g.strokeEllipse(W * 0.85, H * 0.2, 96, 22);
  }

  _buildMenuAstronaut(x, y) {
    const g = this.add.graphics();
    g.fillStyle(0xdde4f0); g.fillCircle(x, y - 48, 22);
    g.fillStyle(0xccccdd); g.fillCircle(x - 6, y - 52, 8);
    g.fillStyle(0x444466); g.fillCircle(x, y - 43, 5);
    g.fillStyle(0xbabac8); g.fillRoundedRect(x - 20, y - 28, 40, 26, 6);
    g.fillStyle(0x777788); g.fillRect(x - 14, y - 24, 28, 5);
    g.fillStyle(0xf97316); g.fillRect(x - 10, y - 18, 20, 7);
    g.fillStyle(0xdde4f0);
    g.fillRoundedRect(x - 32, y - 30, 14, 11, 4);
    g.fillRoundedRect(x + 18, y - 30, 14, 11, 4);
    g.fillStyle(0xd0d0e0);
    g.fillRoundedRect(x - 30, y - 20, 10, 18, 3);
    g.fillRoundedRect(x + 20, y - 20, 10, 18, 3);
    g.fillStyle(0xc0c0d0); g.fillRoundedRect(x - 16, y, 32, 8, 3);
    g.fillStyle(0xd0d0e0);
    g.fillRoundedRect(x - 16, y + 7, 14, 22, 3);
    g.fillRoundedRect(x + 2,  y + 7, 14, 22, 3);
    g.fillStyle(0x333344);
    g.fillRoundedRect(x - 18, y + 27, 16, 7, 2);
    g.fillRoundedRect(x + 2,  y + 27, 16, 7, 2);
    this.tweens.add({ targets: g, y: -12, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  _btn(x, y, label, color, cb) {
    const W = this.scale.width;
    const BW = Math.min(W * 0.7, 300), BH = 50;
    const lx = x - BW / 2, ty = y - BH / 2;

    const gfx = this.add.graphics();
    const draw = (fill) => {
      gfx.clear();
      gfx.fillStyle(fill, 1);
      gfx.fillRoundedRect(lx, ty, BW, BH, 8);
      gfx.lineStyle(1.5, color, 0.9);
      gfx.strokeRoundedRect(lx, ty, BW, BH, 8);
    };
    draw(0x060618);

    const txt = this.add.text(x, y, label, {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffffff'
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, BW, BH).setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      draw(0x001122);
      txt.setColor('#' + color.toString(16).padStart(6, '0'));
    });
    zone.on('pointerout', () => {
      draw(0x060618);
      txt.setColor('#ffffff');
    });
    zone.on('pointerdown', () => {
      draw(0x002244);
      this.time.delayedCall(120, cb);
    });
  }

  _showLeaderboard() {
    const W = this.scale.width;
    const H = this.scale.height;
    const scores = JSON.parse(localStorage.getItem('dod_scores') || '[]');

    const panelW = Math.min(W * 0.85, 360);
    const panelH = 420;
    const panelX = W / 2 - panelW / 2;
    const panelY = H / 2 - panelH / 2;

    const panel = this.add.graphics().setDepth(50);
    panel.fillStyle(0x06061c, 0.97); panel.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    panel.lineStyle(1.5, 0x00d4ff, 0.9); panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);

    this.add.text(W / 2, panelY + 30, '🏆  LEADERBOARD', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ffd700'
    }).setOrigin(0.5).setDepth(51);

    if (scores.length === 0) {
      this.add.text(W / 2, H / 2, 'No scores yet.\nPlay to set a record!', {
        fontFamily: 'monospace', fontSize: '15px', color: '#556688', align: 'center'
      }).setOrigin(0.5).setDepth(51);
    } else {
      scores.slice(0, 8).forEach((sc, i) => {
        this.add.text(W / 2, panelY + 80 + i * 36, `${i + 1}.   ${sc}`, {
          fontFamily: 'monospace', fontSize: '17px',
          color: i === 0 ? '#ffd700' : '#cccccc'
        }).setOrigin(0.5).setDepth(51);
      });
    }

    const closeZone = this.add.zone(W / 2, panelY + panelH - 30, 200, 40).setInteractive({ useHandCursor: true }).setDepth(51);
    this.add.text(W / 2, panelY + panelH - 30, '[  CLOSE  ]', {
      fontFamily: 'monospace', fontSize: '16px', color: '#00d4ff'
    }).setOrigin(0.5).setDepth(52);
    closeZone.on('pointerdown', () => this.scene.restart());
  }

  _showSettings() {
    const W = this.scale.width;
    const H = this.scale.height;
    const t = this.add.text(W / 2, H / 2, 'Settings coming in V2', {
      fontFamily: 'monospace', fontSize: '18px', color: '#aaaacc'
    }).setOrigin(0.5).setDepth(51);
    this.time.delayedCall(1600, () => t.destroy());
  }

  update() {
    if (!this._scrollStars) return;
    const H = this.scale.height;
    this._scrollStars.forEach((s, i) => {
      s.y += this._scrollSpeeds[i] * 0.35;
      if (s.y > H) s.y = 0;
    });
  }
}
