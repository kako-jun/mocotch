"""Pydantic models for API requests and responses"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any


# プロジェクト関連
class ProjectInit(BaseModel):
    """新規プロジェクト作成リクエスト"""
    name: str
    branch: str = "develop"


class ProjectClone(BaseModel):
    """既存プロジェクトクローンリクエスト"""
    name: str
    repo_url: str
    branch: str = "develop"


class ProjectInfo(BaseModel):
    """プロジェクト情報レスポンス"""
    name: str
    description: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    branch: str


class SwitchBranch(BaseModel):
    """ブランチ切替リクエスト"""
    branch: str


# RPGデータ関連
class TileData(BaseModel):
    """タイルデータ"""
    width: int
    height: int
    tile_size: int
    tiles: List[List[int]]


class NPCData(BaseModel):
    """NPCデータ"""
    id: str
    name: str
    x: int
    y: int
    message: str
    color: int


class PlayerData(BaseModel):
    """プレイヤー初期データ"""
    x: int
    y: int
    direction: str


class EventAction(BaseModel):
    """イベントアクション"""
    type: str
    params: Dict[str, Any]


class EventData(BaseModel):
    """イベントデータ"""
    id: str
    name: str
    trigger_type: str
    x: Optional[int] = None
    y: Optional[int] = None
    condition: Optional[str] = None
    actions: List[EventAction]


class RPGProjectData(BaseModel):
    """RPGプロジェクトデータ"""
    name: str
    version: str
    map: TileData
    player: PlayerData
    npcs: List[NPCData]
    events: Optional[List[EventData]] = None


class RPGProjectUpdate(BaseModel):
    """RPGデータ更新リクエスト"""
    data: RPGProjectData
    message: str = "RPGデータ更新"


# Git関連
class CommitRequest(BaseModel):
    """コミットリクエスト"""
    message: str


class GitStatus(BaseModel):
    """Git状態レスポンス"""
    has_uncommitted_changes: bool
    branch: str
    modified_files: List[str]
    untracked_files: List[str]


# アセット関連
class AssetInfo(BaseModel):
    """アセット情報"""
    filename: str
    path: str
    size: int
    created_at: str
