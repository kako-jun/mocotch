"""Git操作を管理するサービス"""
import os
from pathlib import Path
from git import Repo, GitCommandError
from typing import Optional, List, Tuple
import logging

logger = logging.getLogger(__name__)


class GitService:
    """Git操作を管理するサービス（プロジェクトごと）"""

    def __init__(self, project_path: Path, branch: str = "develop"):
        self.project_path = project_path
        self.repo: Optional[Repo] = None
        self.branch = branch

    def init_repo(self) -> bool:
        """新規リポジトリを初期化"""
        try:
            if self.project_path.exists() and (self.project_path / ".git").exists():
                logger.info(f"既存のリポジトリを使用: {self.project_path}")
                self.repo = Repo(self.project_path)
                self._checkout_branch()
                return True

            logger.info(f"新規リポジトリを初期化: {self.project_path}")
            self.project_path.mkdir(parents=True, exist_ok=True)
            self.repo = Repo.init(self.project_path)
            self._set_anonymous_user()
            self._create_initial_commit()
            self._checkout_branch()
            return True
        except Exception as e:
            logger.error(f"リポジトリ初期化失敗: {e}")
            return False

    def clone_repo(self, remote_url: str) -> bool:
        """既存リポジトリをクローン"""
        try:
            if self.project_path.exists():
                logger.error(f"プロジェクトディレクトリが既に存在: {self.project_path}")
                return False

            logger.info(f"リポジトリをクローン: {remote_url}")
            self.repo = Repo.clone_from(remote_url, self.project_path)
            self._set_anonymous_user()
            self._checkout_branch()
            return True
        except Exception as e:
            logger.error(f"リポジトリクローン失敗: {e}")
            return False

    def _set_anonymous_user(self):
        """匿名のユーザー名とメールアドレスを設定"""
        if not self.repo:
            return

        try:
            with self.repo.config_writer() as config:
                config.set_value("user", "name", "anonymous")
                config.set_value("user", "email", "anonymous@localhost")
            logger.info("匿名のGitユーザー情報を設定")
        except Exception as e:
            logger.error(f"Gitユーザー情報の設定に失敗: {e}")

    def _create_initial_commit(self):
        """初期コミットを作成"""
        if self.repo and not self.repo.heads:
            gitkeep = self.project_path / ".gitkeep"
            gitkeep.touch()
            self.repo.index.add([".gitkeep"])
            self.repo.index.commit("Initial commit")
            logger.info("初期コミットを作成")

    def _checkout_branch(self):
        """指定されたブランチにチェックアウト"""
        if not self.repo:
            return

        try:
            if self.branch in self.repo.heads:
                self.repo.heads[self.branch].checkout()
                logger.info(f"ブランチ '{self.branch}' にチェックアウト")
            elif self.repo.remotes and f"origin/{self.branch}" in [str(ref) for ref in self.repo.remotes.origin.refs]:
                self.repo.create_head(self.branch, f"origin/{self.branch}")
                self.repo.heads[self.branch].checkout()
                logger.info(f"リモートブランチ '{self.branch}' からローカルブランチを作成")
            else:
                if self.repo.heads:
                    self.repo.create_head(self.branch)
                    self.repo.heads[self.branch].checkout()
                    logger.info(f"新しいブランチ '{self.branch}' を作成")
        except Exception as e:
            logger.error(f"ブランチチェックアウト失敗: {e}")
            raise

    def pull(self) -> bool:
        """最新の変更を取得"""
        try:
            if self.repo and self.repo.remotes:
                origin = self.repo.remotes.origin
                origin.pull(self.branch)
                logger.info(f"git pull 成功 (ブランチ: {self.branch})")
                return True
        except GitCommandError as e:
            logger.error(f"git pull 失敗: {e}")
        return False

    def commit_all(self, message: str) -> bool:
        """全ての変更をコミット"""
        try:
            if not self.repo:
                raise ValueError("リポジトリが初期化されていません")

            # 全てのファイルをステージング
            self.repo.git.add(A=True)

            # 変更がない場合はスキップ
            if not self.repo.is_dirty(untracked_files=True):
                logger.info("コミットする変更がありません")
                return True

            # コミット
            commit = self.repo.index.commit(message)
            commit_hash = commit.hexsha[:7]
            logger.info(f"コミット成功: {commit_hash} (ブランチ: {self.branch})")
            return True
        except GitCommandError as e:
            logger.error(f"git commit 失敗: {e}")
            return False

    def push(self) -> bool:
        """変更をリモートにプッシュ"""
        try:
            if not self.repo or not self.repo.remotes:
                logger.info("リモートリポジトリが設定されていません")
                return True

            origin = self.repo.remotes.origin
            origin.push(refspec=f"{self.branch}:{self.branch}", set_upstream=True)
            logger.info(f"git push 成功 (ブランチ: {self.branch})")
            return True
        except GitCommandError as e:
            logger.error(f"git push 失敗: {e}")
            return False

    def get_status(self) -> Tuple[bool, List[str], List[str]]:
        """
        Git状態を取得

        Returns:
            (has_changes, modified_files, untracked_files)
        """
        if not self.repo:
            return False, [], []

        try:
            modified = [item.a_path for item in self.repo.index.diff(None)]
            untracked = self.repo.untracked_files
            has_changes = len(modified) > 0 or len(untracked) > 0

            return has_changes, modified, untracked
        except Exception as e:
            logger.error(f"Git状態取得失敗: {e}")
            return False, [], []

    def discard_changes(self) -> bool:
        """未コミットの変更を破棄"""
        try:
            if not self.repo:
                return False

            # 変更されたファイルを元に戻す
            self.repo.git.checkout('.')

            # 未追跡ファイルを削除
            for file in self.repo.untracked_files:
                file_path = self.project_path / file
                if file_path.exists():
                    file_path.unlink()
                    logger.info(f"Deleted untracked file: {file}")

            logger.info("All changes discarded")
            return True
        except Exception as e:
            logger.error(f"Failed to discard changes: {e}")
            return False

    def switch_branch(self, branch: str) -> bool:
        """ブランチを切り替え"""
        try:
            if not self.repo:
                return False

            # 未コミットの変更がある場合はエラー
            if self.repo.is_dirty():
                logger.error("未コミットの変更があります。先にコミットまたは破棄してください")
                return False

            self.branch = branch
            self._checkout_branch()
            return True
        except Exception as e:
            logger.error(f"ブランチ切替失敗: {e}")
            return False

    def get_current_branch(self) -> str:
        """現在のブランチ名を取得"""
        if self.repo and self.repo.active_branch:
            return self.repo.active_branch.name
        return self.branch
