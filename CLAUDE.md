# CLAUDE.md

このプロジェクトはClaude Code Agentによって作成されました。

## プロジェクト構成

- **フレームワーク**: React + Vite + TypeScript
- **ゲームエンジン**: Phaser 3
- **スタイリング**: Tailwind CSS
- **コード品質**: ESLint, Prettier, Husky, lint-staged
- **デプロイ**: GitHub Pages（GitHub Actions）

## 主要ファイル

- `src/App.tsx` - メインアプリケーション
- `src/components/PhaserGame.tsx` - Phaserゲームコンポーネント
- `src/game/MainScene.ts` - ゲームのメインシーン
- `src/game/config.ts` - Phaser設定
- `.github/workflows/deploy.yml` - GitHub Pagesデプロイワークフロー

## ゲームの内容

プラットフォーム型のシンプルなゲームです：

- プレイヤーを操作（矢印キー/スペースキー）
- 星を集めてスコアを獲得
- 爆弾を避ける
