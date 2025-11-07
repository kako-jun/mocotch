# Mocotch Backend API

RPG制作・実行ツールのバックエンドAPI（FastAPI）

## セットアップ

### 必要なもの

- Python 3.11以上
- uv (Python パッケージマネージャー)

### インストール

```bash
cd backend

# 仮想環境作成と依存関係インストール
uv venv
uv sync

# サーバー起動
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

サーバーは http://localhost:8000 で起動します。

### API仕様

APIドキュメントは以下のURLで確認できます：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 主要なエンドポイント

### プロジェクト管理

- `GET /api/projects` - プロジェクト一覧
- `POST /api/projects/init` - 新規プロジェクト作成
- `POST /api/projects/clone` - 既存プロジェクトをクローン
- `POST /api/projects/{name}/sync` - 同期（git pull）

### RPGデータ

- `GET /api/projects/{name}/data` - ゲームデータ取得
- `PUT /api/projects/{name}/data` - ゲームデータ保存

### Git操作

- `GET /api/projects/{name}/status` - Git状態確認
- `POST /api/projects/{name}/commit` - コミット・プッシュ
- `POST /api/projects/{name}/discard` - 未コミットの変更を破棄
- `POST /api/projects/{name}/switch-branch` - ブランチ切替

### アセット管理

- `GET /api/projects/{name}/assets/{type}` - アセット一覧
- `POST /api/projects/{name}/assets/{type}` - アセットアップロード
- `GET /api/projects/{name}/assets/{type}/{filename}` - アセットダウンロード
- `DELETE /api/projects/{name}/assets/{type}/{filename}` - アセット削除

アセットタイプ: `images`, `sounds`, `movies`

## プロジェクト構造

```
backend/
├── app/
│   ├── main.py           # FastAPIアプリケーション
│   ├── models.py         # Pydanticモデル
│   ├── git_service.py    # Git操作サービス
│   └── rpg_service.py    # RPGデータ管理サービス
├── projects/             # RPGプロジェクト（gitignore対象）
│   └── {project-name}/   # 各プロジェクトのリポジトリ
│       ├── game.json     # ゲームデータ
│       ├── .mocotch.json # メタデータ（gitignore対象）
│       └── assets/       # アセットファイル
│           ├── images/
│           ├── sounds/
│           └── movies/
├── pyproject.toml        # uv用依存関係
└── Dockerfile            # Docker設定
```

## ゲームデータフォーマット

`game.json` の形式：

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

タイルタイプ：
- 0: 草地（通行可能）
- 1: 道（通行可能）
- 2: 木（通行不可）
- 3: 水（通行不可）

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
