import Phaser from 'phaser'
import { MainScene } from './MainScene'

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'phaser-game',
  backgroundColor: '#1a4d1a',
  scene: [MainScene],
}
