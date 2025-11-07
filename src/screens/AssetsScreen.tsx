import { useState, useEffect } from 'react'
import { AssetType, Asset } from '../types'

interface AssetsScreenProps {
  projectName: string
  apiBaseUrl: string
  isDark: boolean
  onBack: () => void
  onToggleDark: () => void
  onOpenSettings: () => void
}

function AssetsScreen({
  projectName,
  apiBaseUrl,
  isDark,
  onBack,
  onToggleDark,
  onOpenSettings,
}: AssetsScreenProps) {
  const [currentTab, setCurrentTab] = useState<AssetType>('images')
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadAssets()
  }, [currentTab, apiBaseUrl, projectName])

  const loadAssets = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${apiBaseUrl}/api/projects/${projectName}/assets/${currentTab}`)
      if (!response.ok) throw new Error('アセット一覧の取得に失敗しました')
      const data = await response.json()
      setAssets(data)
    } catch (error) {
      console.error('アセット読み込みエラー:', error)
      alert('アセットの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${apiBaseUrl}/api/projects/${projectName}/assets/${currentTab}`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) throw new Error(`${file.name}のアップロードに失敗しました`)
      }

      // アップロード成功後、リスト再読み込み
      await loadAssets()
    } catch (error) {
      console.error('アップロードエラー:', error)
      alert('アップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (filename: string) => {
    if (!confirm(`「${filename}」を削除しますか？`)) return

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/projects/${projectName}/assets/${currentTab}/${filename}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) throw new Error('削除に失敗しました')

      await loadAssets()
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
    }
  }

  const filteredAssets = assets.filter(asset =>
    asset.filename.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getAssetUrl = (filename: string) => {
    return `${apiBaseUrl}/api/projects/${projectName}/assets/${currentTab}/${filename}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={`flex flex-col h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <header className={`border-b ${isDark ? 'border-gray-700 bg-gray-900' : 'border-blue-200 bg-blue-50'}`}>
        <div className="px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="エディタに戻る"
            >
              ←
            </button>
            <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              アセット管理 <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>- {projectName}</span>
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

      {/* タブ */}
      <div className={`border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className="px-6 py-3 flex gap-2">
          {(['images', 'sounds', 'movies'] as AssetType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                currentTab === tab
                  ? isDark
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab === 'images' && '画像'}
              {tab === 'sounds' && '音声'}
              {tab === 'movies' && '動画'}
            </button>
          ))}
        </div>
      </div>

      {/* 検索バー */}
      <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="ファイル名で検索..."
          className={`w-full px-4 py-2 border rounded ${
            isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>

      {/* アセット一覧 */}
      <main className={`flex-1 overflow-auto p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {loading ? (
          <p className="text-center py-8">読み込み中...</p>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-lg mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchQuery ? '検索結果がありません' : 'アセットがまだありません'}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              下部のアップロード領域からファイルを追加してください
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAssets.map(asset => (
              <div
                key={asset.filename}
                className={`p-4 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                {/* プレビュー */}
                {currentTab === 'images' && (
                  <div className="aspect-video mb-3 bg-gray-200 rounded overflow-hidden">
                    <img
                      src={getAssetUrl(asset.filename)}
                      alt={asset.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* ファイル情報 */}
                <div className="space-y-2">
                  <div
                    className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}
                    title={asset.filename}
                  >
                    {asset.filename}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formatFileSize(asset.size)}
                  </div>

                  {/* アクション */}
                  <div className="flex gap-2 mt-3">
                    <a
                      href={getAssetUrl(asset.filename)}
                      download={asset.filename}
                      className={`flex-1 text-center px-3 py-1 rounded text-sm font-medium transition-colors ${
                        isDark
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      DL
                    </a>
                    <button
                      onClick={() => handleDelete(asset.filename)}
                      className={`flex-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                        isDark
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* アップロード領域 */}
      <div className={`border-t p-6 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <label
          className={`block w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            uploading
              ? 'opacity-50 cursor-not-allowed'
              : isDark
                ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input
            type="file"
            multiple
            disabled={uploading}
            accept={
              currentTab === 'images'
                ? 'image/*'
                : currentTab === 'sounds'
                  ? 'audio/*'
                  : 'video/*'
            }
            onChange={e => handleFileUpload(e.target.files)}
            className="hidden"
          />
          <div className="text-center">
            <p className={`text-lg mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {uploading ? 'アップロード中...' : 'クリックまたはドラッグ&ドロップでアップロード'}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {currentTab === 'images' && '画像ファイル (PNG, JPG, GIF, etc.)'}
              {currentTab === 'sounds' && '音声ファイル (MP3, WAV, OGG, etc.)'}
              {currentTab === 'movies' && '動画ファイル (MP4, WEBM, etc.)'}
            </p>
          </div>
        </label>
      </div>
    </div>
  )
}

export default AssetsScreen
