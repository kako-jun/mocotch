import { useState } from 'react'
import PhaserGame from './components/PhaserGame'
import './App.css'

function App() {
  const [gameStarted, setGameStarted] = useState(false)

  return (
    <div className="App">
      <header className="App-header">
        <h1>ドラクエ風RPG - React + Vite + TypeScript</h1>
      </header>

      <main>
        {!gameStarted ? (
          <div className="start-screen">
            <p>懐かしいドラクエ風のRPGゲームです</p>
            <p>矢印キーで移動、スペースキーで話しかけます</p>
            <button onClick={() => setGameStarted(true)}>冒険を始める</button>
          </div>
        ) : (
          <PhaserGame />
        )}
      </main>
    </div>
  )
}

export default App
