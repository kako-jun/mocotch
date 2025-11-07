import { useState, useRef, useEffect } from 'react'
import SaveDiscardButtons from '../components/SaveDiscardButtons'
import PhaserGame from '../components/PhaserGame'
import { Mode, RPGProject } from '../types'

interface EditorScreenProps {
  projectName: string
  apiBaseUrl: string
  isDark: boolean
  onBack: () => void
  onToggleDark: () => void
  onOpenSettings: () => void
}

function EditorScreen({
  projectName,
  apiBaseUrl,
  isDark,
  onBack,
  onToggleDark,
  onOpenSettings,
}: EditorScreenProps) {
  const [mode, setMode] = useState<Mode>('edit')
  const [projectData, setProjectData] = useState<RPGProject | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const saveTimeoutRef = useRef<number | null>(null)
  const initialDataRef = useRef<string>('')

  // 初回ロード: APIからゲームデータを取得
  useEffect(() => {
    loadProjectData()
  }, [apiBaseUrl, projectName])

  const loadProjectData = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/projects/${projectName}/data`)
      if (!response.ok) throw new Error('データの読み込みに失敗しました')

      const data = await response.json()
      setProjectData(data)
      initialDataRef.current = JSON.stringify(data)

      // Git statusをチェック
      const statusResponse = await fetch(`${apiBaseUrl}/api/projects/${projectName}/status`)
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        setHasUnsavedChanges(statusData.has_uncommitted_changes)
      }
    } catch (error) {
      console.error('プロジェクトデータ読み込み失敗:', error)
      alert('プロジェクトデータの読み込みに失敗しました')
    }
  }

  // データの変更を検出
  useEffect(() => {
    if (!projectData || initialDataRef.current === '') return

    const currentData = JSON.stringify(projectData)
    const hasChanges = currentData !== initialDataRef.current

    if (hasChanges) {
      setHasUnsavedChanges(true)

      // 自動保存（1秒後にワーキングディレクトリに保存）
      if (saveTimeoutRef.current !== null) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = window.setTimeout(async () => {
        try {
          const response = await fetch(`${apiBaseUrl}/api/projects/${projectName}/data`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: projectData,
              message: '自動保存',
            }),
          })
          if (!response.ok) throw new Error('自動保存に失敗しました')
        } catch (error) {
          console.error('自動保存失敗:', error)
        }
      }, 1000)
    }
  }, [projectData, apiBaseUrl, projectName])

  // 保存ボタン: Gitコミット・プッシュ
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`${apiBaseUrl}/api/projects/${projectName}/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'RPGデータ保存',
        }),
      })
      if (!response.ok) throw new Error('コミットに失敗しました')

      initialDataRef.current = JSON.stringify(projectData)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('保存失敗:', error)
      alert('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  // 破棄ボタン: 未コミットの変更を破棄
  const handleDiscard = async () => {
    setShowDiscardConfirm(false)
    setIsSaving(true)
    try {
      const response = await fetch(`${apiBaseUrl}/api/projects/${projectName}/discard`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('変更の破棄に失敗しました')

      // データを再読み込み
      await loadProjectData()
    } catch (error) {
      console.error('破棄失敗:', error)
      alert('変更の破棄に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  if (!projectData) {
    return (
      <div className={`flex items-center justify-center h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white'}`}>
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-screen ${isDark ? 'dark bg-gray-900' : 'bg-white'}`}>
      <header className={`border-b ${isDark ? 'border-gray-700 bg-gray-900' : 'border-blue-200 bg-blue-50'}`}>
        <div className="px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="プロジェクト一覧に戻る"
            >
              ←
            </button>
            <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Mocotch <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>- {projectName}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleDark}
              className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
                isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={onOpenSettings}
              className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
                isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Settings"
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {mode === 'edit' ? (
          <div className={`h-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="text-center">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                エディットモード
              </h2>
              <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                マップエディタは今後実装予定です
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                右下の「▶️」ボタンでゲームをプレイできます
              </p>
            </div>
          </div>
        ) : (
          <PhaserGame />
        )}
      </main>

      {/* 破棄確認ダイアログ */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div
            className={`p-6 rounded-lg shadow-xl max-w-md w-full ${
              isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}
          >
            <h2 className="text-xl font-bold mb-4">変更を破棄しますか？</h2>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              未コミットの変更がすべて失われます。この操作は取り消せません。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                キャンセル
              </button>
              <button
                onClick={handleDiscard}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                破棄
              </button>
            </div>
          </div>
        </div>
      )}

      {/* プレイモード切替 & セーブ/アンドゥボタン */}
      <SaveDiscardButtons
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        isDark={isDark}
        onSave={handleSave}
        onDiscard={() => setShowDiscardConfirm(true)}
        mode={mode}
        onModeChange={setMode}
      />
    </div>
  )
}

export default EditorScreen
