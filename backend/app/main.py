"""FastAPI メインアプリケーション - RPG制作・実行ツールバックエンド"""
import logging
from pathlib import Path
from typing import List
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from .models import (
    ProjectInit,
    ProjectClone,
    ProjectInfo,
    RPGProjectData,
    RPGProjectUpdate,
    CommitRequest,
    GitStatus,
    AssetInfo,
    SwitchBranch,
)
from .git_service import GitService
from .rpg_service import RPGService

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Mocotch API", version="1.0.0")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# プロジェクトのルートディレクトリ
PROJECTS_DIR = Path("./projects")
PROJECTS_DIR.mkdir(parents=True, exist_ok=True)


@app.get("/")
def read_root():
    """ヘルスチェック"""
    return {"message": "Mocotch API is running", "version": "1.0.0"}


@app.get("/api/projects", response_model=List[ProjectInfo])
def list_projects():
    """プロジェクト一覧を取得"""
    try:
        projects = []
        for project_dir in PROJECTS_DIR.iterdir():
            if project_dir.is_dir() and (project_dir / ".git").exists():
                rpg_service = RPGService(project_dir)
                meta = rpg_service.load_meta_data()

                if meta:
                    projects.append(ProjectInfo(**meta))
                else:
                    # メタデータがない場合はディレクトリ名から推測
                    projects.append(ProjectInfo(
                        name=project_dir.name,
                        branch="unknown"
                    ))

        return projects
    except Exception as e:
        logger.error(f"プロジェクト一覧取得失敗: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/projects/init")
def init_project(req: ProjectInit):
    """新規プロジェクトを作成"""
    try:
        project_path = PROJECTS_DIR / req.name

        if project_path.exists():
            raise HTTPException(status_code=400, detail="プロジェクトが既に存在します")

        # RPGプロジェクトデータを作成
        rpg_service = RPGService(project_path)
        if not rpg_service.create_default_project(req.name):
            raise HTTPException(status_code=500, detail="プロジェクト作成失敗")

        # Git初期化
        git_service = GitService(project_path, req.branch)
        if not git_service.init_repo():
            raise HTTPException(status_code=500, detail="Git初期化失敗")

        # 初期コミット
        git_service.commit_all("初期コミット: プロジェクト作成")

        return {"message": "プロジェクト作成成功", "name": req.name}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"プロジェクト作成失敗: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/projects/clone")
def clone_project(req: ProjectClone):
    """既存プロジェクトをクローン"""
    try:
        project_path = PROJECTS_DIR / req.name

        if project_path.exists():
            raise HTTPException(status_code=400, detail="プロジェクトが既に存在します")

        # Git クローン
        git_service = GitService(project_path, req.branch)
        if not git_service.clone_repo(req.repo_url):
            raise HTTPException(status_code=500, detail="クローン失敗")

        return {"message": "クローン成功", "name": req.name}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"クローン失敗: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/projects/{name}/sync")
def sync_project(name: str):
    """プロジェクトを同期（git pull）"""
    try:
        project_path = PROJECTS_DIR / name

        if not project_path.exists():
            raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")

        git_service = GitService(project_path)
        if not git_service.pull():
            raise HTTPException(status_code=500, detail="同期失敗")

        return {"message": "同期成功"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"同期失敗: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects/{name}/data")
def get_project_data(name: str):
    """プロジェクトのゲームデータを取得"""
    try:
        project_path = PROJECTS_DIR / name

        if not project_path.exists():
            raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")

        rpg_service = RPGService(project_path)
        data = rpg_service.load_project_data()

        if data is None:
            raise HTTPException(status_code=500, detail="データ読み込み失敗")

        return data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"データ取得失敗: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/projects/{name}/data")
def update_project_data(name: str, req: RPGProjectUpdate):
    """プロジェクトのゲームデータを保存（自動保存）"""
    try:
        project_path = PROJECTS_DIR / name

        if not project_path.exists():
            raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")

        rpg_service = RPGService(project_path)
        if not rpg_service.save_project_data(req.data.model_dump()):
            raise HTTPException(status_code=500, detail="データ保存失敗")

        return {"message": "データ保存成功"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"データ保存失敗: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects/{name}/status", response_model=GitStatus)
def get_git_status(name: str):
    """Git状態を確認"""
    try:
        project_path = PROJECTS_DIR / name

        if not project_path.exists():
            raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")

        git_service = GitService(project_path)
        has_changes, modified, untracked = git_service.get_status()
        branch = git_service.get_current_branch()

        return GitStatus(
            has_uncommitted_changes=has_changes,
            branch=branch,
            modified_files=modified,
            untracked_files=untracked
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Git状態確認失敗: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/projects/{name}/commit")
def commit_project(name: str, req: CommitRequest):
    """変更をコミット・プッシュ"""
    try:
        project_path = PROJECTS_DIR / name

        if not project_path.exists():
            raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")

        git_service = GitService(project_path)

        # コミット
        if not git_service.commit_all(req.message):
            raise HTTPException(status_code=500, detail="コミット失敗")

        # プッシュ
        if not git_service.push():
            raise HTTPException(status_code=500, detail="プッシュ失敗")

        return {"message": "コミット・プッシュ成功"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"コミット失敗: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/projects/{name}/discard")
def discard_changes(name: str):
    """未コミットの変更を破棄"""
    try:
        project_path = PROJECTS_DIR / name

        if not project_path.exists():
            raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")

        git_service = GitService(project_path)
        if not git_service.discard_changes():
            raise HTTPException(status_code=500, detail="変更破棄失敗")

        return {"message": "変更破棄成功"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"変更破棄失敗: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/projects/{name}/switch-branch")
def switch_branch(name: str, req: SwitchBranch):
    """ブランチを切り替え"""
    try:
        project_path = PROJECTS_DIR / name

        if not project_path.exists():
            raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")

        git_service = GitService(project_path)
        if not git_service.switch_branch(req.branch):
            raise HTTPException(status_code=500, detail="ブランチ切替失敗")

        return {"message": "ブランチ切替成功", "branch": req.branch}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ブランチ切替失敗: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects/{name}/assets/{asset_type}", response_model=List[AssetInfo])
def list_assets(name: str, asset_type: str):
    """アセット一覧を取得"""
    try:
        if asset_type not in ["images", "sounds", "movies"]:
            raise HTTPException(status_code=400, detail="無効なアセットタイプ")

        project_path = PROJECTS_DIR / name

        if not project_path.exists():
            raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")

        rpg_service = RPGService(project_path)
        assets = rpg_service.get_assets(asset_type)

        return [AssetInfo(**asset) for asset in assets]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"アセット一覧取得失敗: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/projects/{name}/assets/{asset_type}")
async def upload_asset(name: str, asset_type: str, file: UploadFile = File(...)):
    """アセットをアップロード"""
    try:
        if asset_type not in ["images", "sounds", "movies"]:
            raise HTTPException(status_code=400, detail="無効なアセットタイプ")

        project_path = PROJECTS_DIR / name

        if not project_path.exists():
            raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")

        # アセットを保存
        asset_dir = project_path / "assets" / asset_type
        asset_dir.mkdir(parents=True, exist_ok=True)

        file_path = asset_dir / file.filename
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        return {"message": "アップロード成功", "filename": file.filename}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"アップロード失敗: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects/{name}/assets/{asset_type}/{filename}")
def download_asset(name: str, asset_type: str, filename: str):
    """アセットをダウンロード"""
    try:
        if asset_type not in ["images", "sounds", "movies"]:
            raise HTTPException(status_code=400, detail="無効なアセットタイプ")

        project_path = PROJECTS_DIR / name
        file_path = project_path / "assets" / asset_type / filename

        if not file_path.exists():
            raise HTTPException(status_code=404, detail="ファイルが見つかりません")

        return FileResponse(file_path)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ダウンロード失敗: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/projects/{name}/assets/{asset_type}/{filename}")
def delete_asset(name: str, asset_type: str, filename: str):
    """アセットを削除"""
    try:
        if asset_type not in ["images", "sounds", "movies"]:
            raise HTTPException(status_code=400, detail="無効なアセットタイプ")

        project_path = PROJECTS_DIR / name
        file_path = project_path / "assets" / asset_type / filename

        if not file_path.exists():
            raise HTTPException(status_code=404, detail="ファイルが見つかりません")

        file_path.unlink()

        return {"message": "削除成功", "filename": filename}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"削除失敗: {e}")
        raise HTTPException(status_code=500, detail=str(e))
