import { useState, useEffect } from 'react'
import { ProjectMeta } from '../types'

interface ProjectListScreenProps {
  apiBaseUrl: string
  isDark: boolean
  onSelectProject: (projectName: string) => void
  onToggleDark: () => void
  onOpenSettings: () => void
}

function ProjectListScreen({
  apiBaseUrl,
  isDark,
  onSelectProject,
  onToggleDark,
  onOpenSettings,
}: ProjectListScreenProps) {
  const [projects, setProjects] = useState<ProjectMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  // プロジェクト一覧を取得
  useEffect(() => {
    loadProjects()
  }, [apiBaseUrl])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${apiBaseUrl}/api/projects`)
      if (!response.ok) throw new Error('プロジェクト一覧の取得に失敗しました')
      const data = await response.json()
      setProjects(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラー')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return

    try {
      const response = await fetch(`${apiBaseUrl}/api/projects/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          branch: 'develop',
        }),
      })

      if (!response.ok) throw new Error('プロジェクト作成に失敗しました')

      setShowNewProject(false)
      setNewProjectName('')
      loadProjects()
    } catch (err) {
      alert(err instanceof Error ? err.message : '不明なエラー')
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Mocotch - RPG制作ツール</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleDark}
              className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
                isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={onOpenSettings}
              className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
                isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Settings"
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">プロジェクト一覧</h2>
          <button
            onClick={() => setShowNewProject(true)}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            + 新規プロジェクト
          </button>
        </div>

        {loading && <p className="text-center py-8">読み込み中...</p>}
        {error && <p className="text-center py-8 text-red-500">エラー: {error}</p>}

        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg mb-4">プロジェクトがまだありません</p>
            <p className="text-sm opacity-70">「新規プロジェクト」ボタンから作成してください</p>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <div
                key={project.name}
                onClick={() => onSelectProject(project.name)}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
                    : 'bg-white border-gray-200 hover:border-blue-400'
                }`}
              >
                <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                {project.description && (
                  <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {project.description}
                  </p>
                )}
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <p>ブランチ: {project.branch}</p>
                  {project.updatedAt && <p>更新: {new Date(project.updatedAt).toLocaleString()}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 新規プロジェクト作成ダイアログ */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg shadow-xl max-w-md w-full ${
              isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}
          >
            <h2 className="text-xl font-bold mb-4">新規プロジェクト作成</h2>
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                プロジェクト名
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                placeholder="my-rpg-game"
                className={`w-full px-3 py-2 border rounded ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                onKeyDown={e => e.key === 'Enter' && handleCreateProject()}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNewProject(false)
                  setNewProjectName('')
                }}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  newProjectName.trim()
                    ? isDark
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectListScreen
