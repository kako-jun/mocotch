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

ドラクエ風のトップダウンRPGです：

### 操作方法

- **スマホ/タブレット**: タップした場所まで自動で移動、NPCをタップすると自動で近づいて会話
- **PC**: 矢印キーで4方向に移動、スペースキーでNPCと会話（クリック操作も可能）

### 特徴

- テキストは画面下部のウインドウに1文字ずつ表示（ドラクエ風）
- マップには草地、道、木、池が配置
- 4人のNPCと会話できる
- BFS（幅優先探索）による経路探索で障害物を自動で回避
