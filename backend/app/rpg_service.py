"""RPGプロジェクトデータを管理するサービス"""
import json
from pathlib import Path
from typing import Optional, Dict, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class RPGService:
    """RPGプロジェクトのデータを管理するサービス"""

    def __init__(self, project_path: Path):
        self.project_path = project_path
        self.data_file = project_path / "game.json"
        self.meta_file = project_path / ".mocotch.json"
        self.assets_dir = project_path / "assets"

    def create_default_project(self, project_name: str) -> bool:
        """デフォルトのプロジェクトデータを作成"""
        try:
            # ディレクトリ構造を作成
            self.project_path.mkdir(parents=True, exist_ok=True)
            (self.assets_dir / "images").mkdir(parents=True, exist_ok=True)
            (self.assets_dir / "sounds").mkdir(parents=True, exist_ok=True)
            (self.assets_dir / "movies").mkdir(parents=True, exist_ok=True)

            # デフォルトのゲームデータ
            default_data = {
                "name": project_name,
                "version": "1.0.0",
                "map": {
                    "width": 25,
                    "height": 19,
                    "tile_size": 32,
                    "tiles": self._create_default_map()
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
                        "message": "ようこそ、この世界へ！",
                        "color": 0xff6b6b
                    },
                    {
                        "id": "npc2",
                        "name": "村人2",
                        "x": 10,
                        "y": 7,
                        "message": "東の方に池があるぞ。",
                        "color": 0xff6b6b
                    },
                    {
                        "id": "npc3",
                        "name": "村人3",
                        "x": 6,
                        "y": 9,
                        "message": "いい天気だね。",
                        "color": 0xff6b6b
                    },
                    {
                        "id": "npc4",
                        "name": "村人4",
                        "x": 15,
                        "y": 5,
                        "message": "冒険の準備はできたかい？",
                        "color": 0xff6b6b
                    }
                ],
                "events": []
            }

            # game.jsonに保存
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(default_data, f, ensure_ascii=False, indent=2)

            # メタデータ
            meta_data = {
                "name": project_name,
                "description": "RPGプロジェクト",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "branch": "develop"
            }

            with open(self.meta_file, 'w', encoding='utf-8') as f:
                json.dump(meta_data, f, ensure_ascii=False, indent=2)

            # .gitignoreを作成
            gitignore_path = self.project_path / ".gitignore"
            with open(gitignore_path, 'w') as f:
                f.write(".mocotch.json\n")

            logger.info(f"デフォルトプロジェクト作成完了: {project_name}")
            return True
        except Exception as e:
            logger.error(f"プロジェクト作成失敗: {e}")
            return False

    def _create_default_map(self):
        """デフォルトマップを作成（既存のMainSceneと同じ）"""
        return [
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
            [2, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
            [2, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
            [2, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
            [2, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
            [2, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2],
            [2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2],
            [2, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3, 3, 3, 0, 0, 2],
            [2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3, 3, 3, 0, 0, 2],
            [2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3, 3, 3, 0, 0, 2],
            [2, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2],
            [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
            [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
            [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
            [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
            [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
            [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        ]

    def load_project_data(self) -> Optional[Dict[str, Any]]:
        """プロジェクトデータを読み込み"""
        try:
            if not self.data_file.exists():
                logger.error(f"ゲームデータファイルが存在しません: {self.data_file}")
                return None

            with open(self.data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            logger.info(f"プロジェクトデータ読み込み成功")
            return data
        except Exception as e:
            logger.error(f"プロジェクトデータ読み込み失敗: {e}")
            return None

    def save_project_data(self, data: Dict[str, Any]) -> bool:
        """プロジェクトデータを保存"""
        try:
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            # メタデータの更新日時を更新
            if self.meta_file.exists():
                with open(self.meta_file, 'r', encoding='utf-8') as f:
                    meta = json.load(f)
                meta["updated_at"] = datetime.now().isoformat()
                with open(self.meta_file, 'w', encoding='utf-8') as f:
                    json.dump(meta, f, ensure_ascii=False, indent=2)

            logger.info("プロジェクトデータ保存成功")
            return True
        except Exception as e:
            logger.error(f"プロジェクトデータ保存失敗: {e}")
            return False

    def load_meta_data(self) -> Optional[Dict[str, Any]]:
        """メタデータを読み込み"""
        try:
            if not self.meta_file.exists():
                return None

            with open(self.meta_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"メタデータ読み込み失敗: {e}")
            return None

    def get_assets(self, asset_type: str):
        """アセットファイル一覧を取得"""
        try:
            asset_path = self.assets_dir / asset_type
            if not asset_path.exists():
                return []

            files = []
            for file_path in asset_path.iterdir():
                if file_path.is_file():
                    stat = file_path.stat()
                    files.append({
                        "filename": file_path.name,
                        "path": str(file_path.relative_to(self.project_path)),
                        "size": stat.st_size,
                        "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat()
                    })

            return files
        except Exception as e:
            logger.error(f"アセット一覧取得失敗: {e}")
            return []
