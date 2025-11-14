import { useState, useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
} from 'react-router-dom'
import ProjectListScreen from './screens/ProjectListScreen'
import EditorScreen from './screens/EditorScreen'
import AssetsScreen from './screens/AssetsScreen'
import './App.css'

function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  const [showSettings, setShowSettings] = useState(false)
  const [apiBaseUrl, setApiBaseUrl] = useState(() => {
    return localStorage.getItem('apiBaseUrl') || 'http://localhost:6565'
  })

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDark))
  }, [isDark])

  useEffect(() => {
    localStorage.setItem('apiBaseUrl', apiBaseUrl)
  }, [apiBaseUrl])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProjectListScreenWrapper
              apiBaseUrl={apiBaseUrl}
              isDark={isDark}
              onToggleDark={() => setIsDark(!isDark)}
              onOpenSettings={() => setShowSettings(true)}
            />
          }
        />
        <Route
          path="/:projectName"
          element={
            <EditorScreenWrapper
              apiBaseUrl={apiBaseUrl}
              isDark={isDark}
              onToggleDark={() => setIsDark(!isDark)}
              onOpenSettings={() => setShowSettings(true)}
            />
          }
        />
        <Route
          path="/:projectName/assets"
          element={
            <AssetsScreenWrapper
              apiBaseUrl={apiBaseUrl}
              isDark={isDark}
              onToggleDark={() => setIsDark(!isDark)}
              onOpenSettings={() => setShowSettings(true)}
            />
          }
        />
      </Routes>

      {/* 設定モーダル */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div
            className={`w-full max-w-md rounded-lg p-6 shadow-xl ${
              isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}
          >
            <h2 className="mb-4 text-xl font-bold">設定</h2>
            <div className="space-y-4">
              <div>
                <label
                  className={`mb-1 block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  API URL
                </label>
                <input
                  type="text"
                  value={apiBaseUrl}
                  onChange={e => setApiBaseUrl(e.target.value)}
                  className={`w-full rounded border px-3 py-2 ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  placeholder="http://localhost:6565"
                />
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className={`w-full rounded px-4 py-2 font-medium ${
                  isDark
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </BrowserRouter>
  )
}

function ProjectListScreenWrapper({
  apiBaseUrl,
  isDark,
  onToggleDark,
  onOpenSettings,
}: {
  apiBaseUrl: string
  isDark: boolean
  onToggleDark: () => void
  onOpenSettings: () => void
}) {
  const navigate = useNavigate()

  const handleSelectProject = (projectName: string) => {
    navigate(`/${projectName}`)
  }

  return (
    <ProjectListScreen
      apiBaseUrl={apiBaseUrl}
      isDark={isDark}
      onSelectProject={handleSelectProject}
      onToggleDark={onToggleDark}
      onOpenSettings={onOpenSettings}
    />
  )
}

function EditorScreenWrapper({
  apiBaseUrl,
  isDark,
  onToggleDark,
  onOpenSettings,
}: {
  apiBaseUrl: string
  isDark: boolean
  onToggleDark: () => void
  onOpenSettings: () => void
}) {
  const { projectName } = useParams<{ projectName: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    if (projectName) {
      document.title = `${projectName} - Mocotch`
    }
  }, [projectName])

  if (!projectName) {
    navigate('/')
    return null
  }

  const handleBack = () => {
    navigate('/')
  }

  return (
    <EditorScreen
      projectName={projectName}
      apiBaseUrl={apiBaseUrl}
      isDark={isDark}
      onBack={handleBack}
      onToggleDark={onToggleDark}
      onOpenSettings={onOpenSettings}
    />
  )
}

function AssetsScreenWrapper({
  apiBaseUrl,
  isDark,
  onToggleDark,
  onOpenSettings,
}: {
  apiBaseUrl: string
  isDark: boolean
  onToggleDark: () => void
  onOpenSettings: () => void
}) {
  const { projectName } = useParams<{ projectName: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    if (projectName) {
      document.title = `${projectName} - アセット管理 - Mocotch`
    }
  }, [projectName])

  if (!projectName) {
    navigate('/')
    return null
  }

  const handleBack = () => {
    navigate(`/${projectName}`)
  }

  return (
    <AssetsScreen
      projectName={projectName}
      apiBaseUrl={apiBaseUrl}
      isDark={isDark}
      onBack={handleBack}
      onToggleDark={onToggleDark}
      onOpenSettings={onOpenSettings}
    />
  )
}

export default App
