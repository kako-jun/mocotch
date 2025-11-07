import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { gameConfig } from '../game/config'
import { RPGProject } from '../types'
import './PhaserGame.css'

interface PhaserGameProps {
  gameData?: RPGProject
}

const PhaserGame = ({ gameData }: PhaserGameProps) => {
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (!gameRef.current && gameData) {
      gameRef.current = new Phaser.Game(gameConfig)

      // ゲーム起動後にシーンを開始（データを渡す）
      gameRef.current.events.once('ready', () => {
        const mainScene = gameRef.current?.scene.getScene('MainScene')
        if (mainScene) {
          mainScene.scene.restart({ gameData })
        }
      })
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [gameData])

  if (!gameData) {
    return (
      <div className="phaser-game-container flex items-center justify-center">
        <p className="text-gray-500">ゲームデータを読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="phaser-game-container">
      <div id="phaser-game" />
    </div>
  )
}

export default PhaserGame
