import { Mode } from '../types'

interface SaveDiscardButtonsProps {
  hasUnsavedChanges: boolean
  isSaving: boolean
  isDark: boolean
  onSave: () => void
  onDiscard: () => void
  mode?: Mode
  onModeChange?: (mode: Mode) => void
}

function SaveDiscardButtons({
  hasUnsavedChanges,
  isSaving,
  isDark,
  onSave,
  onDiscard,
  mode,
  onModeChange,
}: SaveDiscardButtonsProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      {/* プレイモード切替（オプション） */}
      {mode && onModeChange && (
        <div className="flex gap-2">
          <button
            className={`w-12 h-12 flex items-center justify-center transition-colors rounded-lg shadow-md border ${
              mode === 'edit'
                ? isDark
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-gray-900 text-white border-gray-800'
                : isDark
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 border-gray-700'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-300'
            }`}
            onClick={() => onModeChange('edit')}
            title="Edit Mode"
          >
            ✏️
          </button>
          <button
            className={`w-12 h-12 flex items-center justify-center transition-colors rounded-lg shadow-md border ${
              mode === 'play'
                ? isDark
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-gray-900 text-white border-gray-800'
                : isDark
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 border-gray-700'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-300'
            }`}
            onClick={() => onModeChange('play')}
            title="Play Mode"
          >
            ▶️
          </button>
        </div>
      )}

      {/* アンドゥ/セーブボタン */}
      <div className="flex gap-2">
        {/* アンドゥボタン */}
        <button
          className={`w-12 h-12 flex items-center justify-center transition-colors rounded-lg shadow-md border ${
            hasUnsavedChanges && !isSaving
              ? isDark
                ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600'
                : 'bg-gray-400 text-white border-gray-300 hover:bg-gray-500'
              : isDark
                ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
          }`}
          onClick={onDiscard}
          disabled={!hasUnsavedChanges || isSaving}
          title={hasUnsavedChanges ? '変更を破棄' : '変更なし'}
        >
          ↶
        </button>

        {/* セーブボタン */}
        <button
          className={`w-12 h-12 flex items-center justify-center transition-colors rounded-lg shadow-md border ${
            hasUnsavedChanges && !isSaving
              ? isDark
                ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700'
                : 'bg-blue-500 text-white border-blue-400 hover:bg-blue-600'
              : isDark
                ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
          }`}
          onClick={onSave}
          disabled={!hasUnsavedChanges || isSaving}
          title={hasUnsavedChanges ? 'Gitにコミット・プッシュ' : '保存済み'}
        >
          {isSaving ? '⏳' : '💾'}
        </button>
      </div>
    </div>
  )
}

export default SaveDiscardButtons
