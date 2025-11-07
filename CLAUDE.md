# Mocotch - RPG制作・実行ツール

このプロジェクトはname-nameリポジトリをベースに、ノベルゲームからRPGに変更したものです。

## プロジェクト概要

**Mocotch**: ドラクエ風RPGの制作・実行ツール

- エディットモード: マップエディタでRPGワールドを作成（今後実装予定）
- プレイモード: Phaserでゲーム実行
- Git管理: ゲームデータとアセットをGitで自動バージョン管理
- プロジェクト管理: 各RPGゲームは独立したGitリポジトリとして管理

## プロジェクト構造（モノレポ）

```
mocotch/
├── src/                    # フロントエンド (React + Vite + TypeScript)
│   ├── components/        # UIコンポーネント
│   │   ├── PhaserGame.tsx      # Phaserゲームコンポーネント
│   │   └── SaveDiscardButtons.tsx # セーブ/破棄ボタン
│   ├── screens/           # 画面コンポーネント
│   │   ├── ProjectListScreen.tsx # プロジェクト一覧
│   │   └── EditorScreen.tsx      # エディタ画面
│   ├── game/              # Phaserゲーム
│   │   ├── MainScene.ts        # ゲームメインシーン
│   │   └── config.ts           # Phaser設定
│   ├── types.ts           # TypeScript型定義
│   ├── App.tsx            # メインアプリ
│   └── main.tsx           # エントリーポイント
├── backend/               # バックエンド (FastAPI + Python)
│   ├── app/
│   │   ├── main.py             # APIエンドポイント
│   │   ├── models.py           # Pydanticモデル
│   │   ├── git_service.py      # Git操作
│   │   └── rpg_service.py      # RPGデータ管理
│   ├── projects/               # ゲームプロジェクト（gitignore対象）
│   │   └── {game-name}/        # 各ゲームのリポジトリ
│   ├── pyproject.toml          # uv用依存関係
│   └── .gitignore
├── compose.yaml           # Docker Compose設定
├── package.json           # フロントエンド依存関係
└── CLAUDE.md              # このファイル
```

## 技術スタック

### フロントエンド
- React 18 + TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- Phaser 3

### バックエンド
- FastAPI (Python)
- GitPython
- Pydantic

### インフラ
- Docker Compose

## 重要な設計原則

### 1. ツールとゲームデータの分離
- **Mocotchツール**: このリポジトリ
- **ゲームプロジェクト**: 別リポジトリ（例: my-rpg-game）
- 各ゲームは`backend/projects/`にクローンされる（gitignore対象）

### 2. Windowsでも動作する
- シンボリックリンクは使わない
- API経由でリポジトリをクローン・管理
- パスはOS依存しない形で扱う

### 3. ブランチ戦略
- **develop**: 開発・編集用（デフォルト）
- **main**: 本番公開用
- ローカル環境はdevelopブランチ
- 本番環境はmainブランチを参照（予定）

## 開発環境のセットアップ

### フロントエンド (React + Vite)

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
# → http://localhost:5173
```

### バックエンド (FastAPI + Python)

```bash
cd backend

# 仮想環境作成と依存関係インストール
uv venv
uv sync

# サーバー起動
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# → http://localhost:8000
```

### Docker Compose（推奨）

```bash
# ルートディレクトリで
docker compose up
```

フロントエンドとバックエンドが同時に起動します。

## ゲームプロジェクトの管理

### 新規ゲームの作成

```bash
# APIで初期化（フロントエンドのUIから作成可能）
curl -X POST http://localhost:8000/api/projects/init \
  -H "Content-Type: application/json" \
  -d '{"name": "my-rpg-game", "branch": "develop"}'
```

これで以下が自動生成されます：
- Git リポジトリ
- game.json（ゲームデータ）
- .mocotch.json（メタデータ、gitignore対象）
- assets/images/
- assets/sounds/
- assets/movies/

### 既存ゲームのクローン

```bash
# APIでクローン
curl -X POST http://localhost:8000/api/projects/clone \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-rpg-game",
    "repo_url": "https://github.com/user/my-rpg-game.git",
    "branch": "develop"
  }'
```

**重要**:
- 手動で`git clone`しない
- 必ずAPI経由でクローン（Windows互換性のため）
- クローンされたプロジェクトは`backend/projects/`に配置

## ゲームプロジェクトの構造

各ゲームリポジトリは以下の構造を持ちます：

```
my-rpg-game/
├── .git/
├── .gitignore          # .mocotch.jsonを除外
├── .mocotch.json       # ローカル設定（ブランチ情報）
├── game.json           # ゲームデータ
└── assets/
    ├── images/         # 画像ファイル
    ├── sounds/         # 音声ファイル
    └── movies/         # 動画ファイル
```

### ゲームデータフォーマット (game.json)

```json
{
  "name": "my-rpg-game",
  "version": "1.0.0",
  "map": {
    "width": 25,
    "height": 19,
    "tile_size": 32,
    "tiles": [[0, 1, 2, ...], ...]
  },
  "player": {
    "x": 5,
    "y": 5,
    "direction": "down"
  },
  "npcs": [
    {
      "id": "npc1",
      "name": "村人1",
      "x": 4,
      "y": 3,
      "message": "こんにちは！",
      "color": 16743275
    }
  ],
  "events": []
}
```

**タイルタイプ**:
- 0: 草地（通行可能）
- 1: 道（通行可能）
- 2: 木（通行不可）
- 3: 水（通行不可）

## モード切り替え

### エディットモード
- マップエディタでタイル配置（今後実装予定）
- NPC配置エディタ（今後実装予定）
- イベント設定（今後実装予定）

### プレイモード
- Phaserでゲーム実行
- 既存のMainSceneを使用
- ドラクエ風の操作感

右下のボタンでモード切り替え可能。

## 保存の仕組み

### 自動保存（ワーキングディレクトリ）
- ゲームデータの変更は1秒後に自動保存
- ワーキングディレクトリに書き込まれるのみ（コミットはしない）
- セーブボタンが青く表示される（未コミットの変更あり）

### 手動コミット（セーブボタン）
- セーブボタンを押すとGitコミット・プッシュ
- コミット成功後、セーブボタンの青色が消える

## API エンドポイント一覧

### プロジェクト管理
- `GET /api/projects` - プロジェクト一覧
- `POST /api/projects/init` - 新規作成
- `POST /api/projects/clone` - クローン
- `POST /api/projects/{name}/sync` - 同期

### RPGデータ
- `GET /api/projects/{name}/data` - ゲームデータ取得
- `PUT /api/projects/{name}/data` - ゲームデータ保存

### アセット管理
- `GET /api/projects/{name}/assets/{type}` - 一覧（type: images/sounds/movies）
- `POST /api/projects/{name}/assets/{type}` - アップロード
- `GET /api/projects/{name}/assets/{type}/{filename}` - ダウンロード
- `DELETE /api/projects/{name}/assets/{type}/{filename}` - 削除

### コミット・同期
- `GET /api/projects/{name}/status` - 未コミットの変更確認
- `POST /api/projects/{name}/commit` - コミット・プッシュ
- `POST /api/projects/{name}/discard` - 変更破棄
- `POST /api/projects/{name}/switch-branch` - ブランチ切替

## よく使うコマンド

### 開発

```bash
# フロントエンド
npm run dev

# バックエンド
cd backend
uv run uvicorn app.main:app --reload --port 8000

# Docker Compose
docker compose up
```

### ビルド

```bash
# フロントエンド
npm run build
npm run preview
```

### コード品質

```bash
# Lint
npm run lint

# Format
npm run format
```

## 現在の実装状況

### 完了
- ✅ バックエンドAPI実装完了
- ✅ プロジェクト管理機能完成
- ✅ RPGデータ管理機能完成
- ✅ アセット管理機能完成
- ✅ Git統合機能完成（自動保存、コミット、プッシュ）
- ✅ フロントエンドとバックエンドの統合
- ✅ プロジェクト一覧画面
- ✅ エディタ画面（Edit/Playモード切り替え）
- ✅ プレイモード（Phaserゲーム実行）
- ✅ ダークモード対応
- ✅ Docker Compose設定

### 未実装（今後の予定）
- ⬜ マップエディタ（タイル配置UI）
- ⬜ NPC配置エディタ
- ⬜ イベント設定UI
- ⬜ アセット管理画面（images, sounds, movies）
- ⬜ MainSceneをデータ駆動型に変更（game.jsonからデータを読み込む）
- ⬜ タグ機能（アセット分類）
- ⬜ 本番環境へのデプロイ設定

## ゲームの操作方法

### プレイモード

- **スマホ/タブレット**: タップした場所まで自動で移動、NPCをタップすると自動で近づいて会話
- **PC**: 矢印キーで4方向に移動、スペースキーでNPCと会話（クリック操作も可能）

### 特徴

- テキストは画面下部のウインドウに1文字ずつ表示（ドラクエ風）
- BFS（幅優先探索）による経路探索で障害物を自動で回避
- マップには草地、道、木、池が配置
- NPCと会話できる

## 開発時の注意点

1. **シンボリックリンクは使わない** - Windows互換性のため
2. **API経由でプロジェクト管理** - 手動のgit操作は避ける
3. **ブランチを意識** - develop（開発）/ main（本番）
4. **projects/はgitignore対象** - 各ゲームは独立したリポジトリ
5. **uvを使う** - Python依存関係管理

## トラブルシューティング

### ポート8000が使用中
```bash
# プロセスを確認
lsof -i :8000

# または別のポートを使用
uv run uvicorn app.main:app --reload --port 8001
```

### プロジェクトのクローンに失敗
- `backend/projects/{name}`が既に存在している可能性
- 手動で削除してから再クローン
```bash
rm -rf backend/projects/{name}
```

### バックエンドの依存関係エラー
```bash
cd backend
rm -rf .venv
uv venv
uv sync
```

## 参考ドキュメント

- `backend/README.md` - バックエンドAPI詳細
- [name-name リポジトリ](https://github.com/kako-jun/name-name) - ベースとなったノベルゲームツール
