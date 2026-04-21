import { useState, useEffect } from 'react'
import Game from './components/Game'
import ManageWords from './components/ManageWords'
import { INITIAL_WORDS } from './data/words'
import './App.css'

const STORAGE_KEY = 'korean-words'

function loadWords() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  // seed with initial data, assign ids
  return INITIAL_WORDS.map((w, i) => ({ ...w, id: i + 1 }))
}

function saveWords(words) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words))
}

export default function App() {
  const [tab, setTab] = useState('game')
  const [words, setWords] = useState(loadWords)

  useEffect(() => { saveWords(words) }, [words])

  function addWord(word) {
    const id = words.length > 0 ? Math.max(...words.map(w => w.id)) + 1 : 1
    setWords(prev => [...prev, { ...word, id }])
  }

  function updateWord(id, updated) {
    setWords(prev => prev.map(w => w.id === id ? { ...w, ...updated } : w))
  }

  function deleteWord(id) {
    setWords(prev => prev.filter(w => w.id !== id))
  }

  return (
    <>
      <header>
        <div className="header-brand">
          <div className="header-icon">🇰🇷</div>
          <h1>한국어 배우기</h1>
        </div>
        <span className="header-sub">Learn Korean</span>
      </header>

      {/* Top tabs (tablet/desktop) */}
      <div className="top-tabs">
        <button className={`tab-btn${tab === 'game' ? ' active' : ''}`} onClick={() => setTab('game')}>
          🎮 Play Game
        </button>
        <button className={`tab-btn${tab === 'manage' ? ' active' : ''}`} onClick={() => setTab('manage')}>
          📚 Manage Words
        </button>
      </div>

      <main>
        <div className={`tab-content${tab === 'game' ? ' active' : ''}`}>
          <Game words={words} />
        </div>
        <div className={`tab-content${tab === 'manage' ? ' active' : ''}`}>
          <ManageWords words={words} onAdd={addWord} onUpdate={updateWord} onDelete={deleteWord} />
        </div>
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="bottom-nav">
        <button className={`tab-btn${tab === 'game' ? ' active' : ''}`} onClick={() => setTab('game')}>
          <span className="nav-icon">🎮</span>
          Play
        </button>
        <button className={`tab-btn${tab === 'manage' ? ' active' : ''}`} onClick={() => setTab('manage')}>
          <span className="nav-icon">📚</span>
          Manage
        </button>
      </nav>
    </>
  )
}
