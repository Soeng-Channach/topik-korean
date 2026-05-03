import { useState, useEffect } from 'react'
import Game from './components/Game'
import ManageWords from './components/ManageWords'
import { INITIAL_WORDS } from './data/words'
import { TOPIK1_WORDS, TOPIK2_WORDS } from './data/topik-words'
import './App.css'

const STORAGE_KEY = 'korean-words'
const TOPIK1_STORAGE_KEY = 'topik1-words'
const TOPIK2_STORAGE_KEY = 'topik2-words'

function loadWords() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return INITIAL_WORDS.map((w, i) => ({ ...w, id: i + 1 }))
}

function loadTopikWords(key, defaults) {
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      const parsed = JSON.parse(saved)
      const defaultMap = new Map(defaults.map(w => [w.no, w]))
      return parsed.map(w => ({
        ...w,
        khmerWord: w.khmerWord || defaultMap.get(w.no)?.khmerWord || ''
      }))
    }
  } catch {}
  return defaults
}

export default function App() {
  const [tab, setTab] = useState('game')
  const [words, setWords] = useState(loadWords)
  const [topik1Words, setTopik1Words] = useState(() => loadTopikWords(TOPIK1_STORAGE_KEY, TOPIK1_WORDS))
  const [topik2Words, setTopik2Words] = useState(() => loadTopikWords(TOPIK2_STORAGE_KEY, TOPIK2_WORDS))

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(words)) }, [words])
  useEffect(() => { localStorage.setItem(TOPIK1_STORAGE_KEY, JSON.stringify(topik1Words)) }, [topik1Words])
  useEffect(() => { localStorage.setItem(TOPIK2_STORAGE_KEY, JSON.stringify(topik2Words)) }, [topik2Words])

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

  function resetWords() {
    setWords(INITIAL_WORDS.map((w, i) => ({ ...w, id: i + 1 })))
  }

  function addTopikWord(src, word) {
    const setter = src === 'topik1' ? setTopik1Words : setTopik2Words
    const list = src === 'topik1' ? topik1Words : topik2Words
    const maxNo = list.length > 0 ? Math.max(...list.map(w => w.no)) + 1 : 1
    const category = src === 'topik1' ? 'TOPIK I' : 'TOPIK II'
    setter(prev => [...prev, { ...word, no: maxNo, category }])
  }

  function updateTopikWord(src, no, updated) {
    const setter = src === 'topik1' ? setTopik1Words : setTopik2Words
    setter(prev => prev.map(w => w.no === no ? { ...w, ...updated } : w))
  }

  function deleteTopikWord(src, no) {
    const setter = src === 'topik1' ? setTopik1Words : setTopik2Words
    setter(prev => prev.filter(w => w.no !== no))
  }

  function resetTopikWords(src) {
    if (src === 'topik1') {
      setTopik1Words(TOPIK1_WORDS)
      localStorage.removeItem(TOPIK1_STORAGE_KEY)
    } else {
      setTopik2Words(TOPIK2_WORDS)
      localStorage.removeItem(TOPIK2_STORAGE_KEY)
    }
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
          <Game words={words} topik1={topik1Words} topik2={topik2Words} />
        </div>
        <div className={`tab-content${tab === 'manage' ? ' active' : ''}`}>
          <ManageWords
            words={words}
            onAdd={addWord}
            onUpdate={updateWord}
            onDelete={deleteWord}
            onReset={resetWords}
            topik1={topik1Words}
            topik2={topik2Words}
            onTopikAdd={addTopikWord}
            onTopikUpdate={updateTopikWord}
            onTopikDelete={deleteTopikWord}
            onTopikReset={resetTopikWords}
          />
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
