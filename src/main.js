import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import SplashScene from './scenes/SplashScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#020510',
  parent: 'game-container',
  scene: [BootScene, SplashScene, MenuScene, GameScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%',
    parent: 'game-container'
  },
  render: {
    antialias: true,
    roundPixels: false
  },
  input: {
    activePointers: 1
  }
};

new Phaser.Game(config);
