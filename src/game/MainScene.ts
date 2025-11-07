import Phaser from 'phaser'

export class MainScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite
  private platforms?: Phaser.Physics.Arcade.StaticGroup
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private score = 0
  private scoreText?: Phaser.GameObjects.Text
  private stars?: Phaser.Physics.Arcade.Group
  private bombs?: Phaser.Physics.Arcade.Group
  private gameOver = false

  constructor() {
    super({ key: 'MainScene' })
  }

  preload() {
    // プリロード処理（アセットがないのでスキップ）
  }

  create() {
    // 背景
    this.add.rectangle(400, 300, 800, 600, 0x87ceeb)

    // プラットフォームの作成
    this.platforms = this.physics.add.staticGroup()

    // 地面
    this.platforms.create(400, 568, '').setDisplaySize(800, 64).refreshBody()
    this.add.rectangle(400, 568, 800, 64, 0x00ff00)

    // 中間プラットフォーム
    const platformPositions = [
      { x: 600, y: 400 },
      { x: 50, y: 250 },
      { x: 750, y: 220 },
    ]

    platformPositions.forEach(pos => {
      this.platforms!.create(pos.x, pos.y, '')
        .setDisplaySize(200, 32)
        .refreshBody()
      this.add.rectangle(pos.x, pos.y, 200, 32, 0x00aa00)
    })

    // プレイヤーの作成
    this.player = this.physics.add.sprite(100, 450, '')
    this.add.circle(100, 450, 16, 0xff0000).setDepth(1)
    this.player.setDisplaySize(32, 32)
    this.player.setBounce(0.2)
    this.player.setCollideWorldBounds(true)

    // 星の作成
    this.stars = this.physics.add.group()

    for (let i = 0; i < 12; i++) {
      const x = Phaser.Math.Between(50, 750)
      const y = Phaser.Math.Between(0, 300)
      const star = this.stars.create(x, y, '')
      star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
      star.setDisplaySize(24, 24)
      this.add.star(x, y, 5, 8, 12, 0xffff00).setDepth(1)
    }

    // 爆弾グループ
    this.bombs = this.physics.add.group()

    // スコアテキスト
    this.scoreText = this.add.text(16, 16, 'スコア: 0', {
      fontSize: '32px',
      color: '#000',
    })

    // 操作説明
    this.add.text(16, 56, '矢印キー: 移動 / スペース: ジャンプ', {
      fontSize: '16px',
      color: '#000',
    })

    // コリジョン設定
    this.physics.add.collider(this.player, this.platforms)
    this.physics.add.collider(this.stars, this.platforms)
    this.physics.add.collider(this.bombs, this.platforms)

    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    )

    this.physics.add.collider(
      this.player,
      this.bombs,
      this.hitBomb as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    )

    // キーボード入力
    this.cursors = this.input.keyboard?.createCursorKeys()
  }

  update() {
    if (this.gameOver) {
      return
    }

    if (!this.cursors || !this.player) {
      return
    }

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160)
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160)
    } else {
      this.player.setVelocityX(0)
    }

    if (this.cursors.space.isDown && this.player.body?.touching.down) {
      this.player.setVelocityY(-330)
    }
  }

  private collectStar(
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    star: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    ;(star as Phaser.Physics.Arcade.Sprite).disableBody(true, true)

    this.score += 10
    this.scoreText?.setText('スコア: ' + this.score)

    if (this.stars?.countActive(true) === 0) {
      this.stars.children.iterate(child => {
        const star = child as Phaser.Physics.Arcade.Sprite
        star.enableBody(true, star.x, 0, true, true)
        return true
      })

      if (this.player) {
        const x =
          this.player.x < 400
            ? Phaser.Math.Between(400, 800)
            : Phaser.Math.Between(0, 400)

        const bomb = this.bombs?.create(x, 16, '')
        if (bomb) {
          bomb.setBounce(1)
          bomb.setCollideWorldBounds(true)
          bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
          bomb.setDisplaySize(24, 24)
          this.add.circle(x, 16, 12, 0x000000).setDepth(1)
        }
      }
    }
  }

  private hitBomb(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    _bomb: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    this.physics.pause()
    ;(player as Phaser.Physics.Arcade.Sprite).setTint(0xff0000)
    this.gameOver = true

    this.add
      .text(400, 300, 'ゲームオーバー!\nF5でリロード', {
        fontSize: '48px',
        color: '#ff0000',
        align: 'center',
      })
      .setOrigin(0.5)
  }
}
