import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateQuestion(pool) {
  if (pool.length < 5) return null
  const shuffled = shuffle(pool)
  const correct = shuffled[0]
  // Pick 5 distinct Korean words to avoid duplicate buttons
  const seen = new Set([correct.koreanWord])
  const distractors = []
  for (const w of shuffled.slice(1)) {
    if (distractors.length >= 4) break
    if (!seen.has(w.koreanWord)) { distractors.push(w.koreanWord); seen.add(w.koreanWord) }
  }
  if (distractors.length < 4) return null
  const choices = shuffle([correct.koreanWord, ...distractors])
  return {
    englishWord: correct.englishWord,
    khmerWord: correct.khmerWord || '',
    category: correct.category,
    correctAnswer: correct.koreanWord,
    choices
  }
}

export default function Game({ words, topik1, topik2 }) {
  const [mode, setMode] = useState('free')   // 'free' | 'topik1' | 'topik2'
  const [category, setCategory] = useState('All')
  const [question, setQuestion] = useState(null)
  const [selected, setSelected] = useState(null)
  const [lastPts, setLastPts] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [round, setRound] = useState(1)

  const categories = useMemo(() => {
    const cats = [...new Set(words.map(w => w.category))].sort()
    return ['All', ...cats]
  }, [words])

  const pool = useMemo(() => {
    if (mode === 'topik1') return topik1
    if (mode === 'topik2') return topik2
    return category === 'All' ? words : words.filter(w => w.category === category)
  }, [words, topik1, topik2, mode, category])

  const nextQuestion = useCallback(() => {
    setQuestion(generateQuestion(pool))
    setSelected(null)
  }, [pool])

  useEffect(() => { nextQuestion() }, [nextQuestion])

  function resetStats() {
    setScore(0); setStreak(0); setBestStreak(0); setRound(1)
  }

  function applyAnswer(kr) {
    if (selected || !question) return
    setSelected(kr)
    if (kr === question.correctAnswer) {
      const pts = 10 + streak * 2
      setLastPts(pts)
      setScore(s => s + pts)
      const ns = streak + 1
      setStreak(ns)
      setBestStreak(b => Math.max(b, ns))
    } else {
      setStreak(0)
    }
  }

  function handleNext() {
    setRound(r => r + 1)
    nextQuestion()
  }

  function handleModeChange(m) {
    setMode(m)
    resetStats()
  }

  function handleCategoryChange(cat) {
    setCategory(cat)
    resetStats()
  }

  // Keyboard handler — always reads latest values via ref
  const handlerRef = useRef({})
  handlerRef.current = { question, selected, applyAnswer, handleNext }

  useEffect(() => {
    function onKey(e) {
      const { question, selected, applyAnswer, handleNext } = handlerRef.current
      if (!question) return
      if (!selected) {
        const n = parseInt(e.key, 10)
        if (!isNaN(n) && n >= 1 && n <= question.choices.length) {
          applyAnswer(question.choices[n - 1])
        }
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const emptyMsg = pool.length < 5 ? (
    mode === 'topik1' ? 'TOPIK I words could not be loaded.' :
    mode === 'topik2' ? 'TOPIK II words could not be loaded.' :
    category !== 'All' ? `"${category}" has fewer than 5 words. Add more or switch to All.` :
    'Add at least 5 words in the Manage Words tab to play.'
  ) : null

  if (emptyMsg) {
    return (
      <div className="game-empty">
        <p>{emptyMsg}</p>
        {mode === 'free' && category !== 'All' && (
          <button className="btn-next game-empty-btn" onClick={() => handleCategoryChange('All')}>
            Play All Categories
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="game-wrap">

      {/* Mode selector */}
      <div className="game-mode-bar">
        <button
          className={`mode-btn${mode === 'free' ? ' active' : ''}`}
          onClick={() => handleModeChange('free')}
        >
          <span className="mode-label">🎮 Free Play</span>
          <span className="mode-sub">{words.length} words</span>
        </button>
        <button
          className={`mode-btn topik1${mode === 'topik1' ? ' active' : ''}`}
          onClick={() => handleModeChange('topik1')}
        >
          <span className="mode-label">TOPIK I</span>
          <span className="mode-sub">Beginner · {topik1.length}w</span>
        </button>
        <button
          className={`mode-btn topik2${mode === 'topik2' ? ' active' : ''}`}
          onClick={() => handleModeChange('topik2')}
        >
          <span className="mode-label">TOPIK II</span>
          <span className="mode-sub">Advanced · {topik2.length}w</span>
        </button>
      </div>

      {/* Category filter (Free Play only) */}
      {mode === 'free' && (
        <div className="game-filter">
          <span className="game-filter-label">Category</span>
          <select value={category} onChange={e => handleCategoryChange(e.target.value)} aria-label="Select category">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {/* TOPIK level banner */}
      {mode !== 'free' && (
        <div className={`topik-banner topik-banner-${mode}`}>
          {mode === 'topik1'
            ? '📋 TOPIK I — Beginner vocabulary (Levels 1–2)'
            : '📚 TOPIK II — Intermediate / Advanced (Levels 3–6)'}
        </div>
      )}

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-chip">
          <span className="chip-label">Score</span>
          <span className="stat-val gold">{score}</span>
        </div>
        <div className="stat-chip">
          <span className="chip-label">Streak 🔥</span>
          <span className="stat-val cyan">{streak}</span>
        </div>
        <div className="stat-chip">
          <span className="chip-label">Best ⭐</span>
          <span className="stat-val violet">{bestStreak}</span>
        </div>
        <div className="stat-chip">
          <span className="chip-label">Round</span>
          <span className="stat-val">{round}</span>
        </div>
      </div>

      {question && (
        <>
          <div className="english-word-card" key={question.englishWord}>
            <div className="card-label">Translate to Korean</div>
            <div className="word">{question.englishWord}</div>
            <div className="word-category-badge">{question.category}</div>
          </div>

          <div className="choices-label">Choose the correct Korean meaning</div>

          <div className="choices">
            {question.choices.map((kr, i) => {
              let cls = 'choice-btn'
              if (selected) {
                if (kr === question.correctAnswer) cls += ' correct'
                else if (kr === selected) cls += ' wrong'
              }
              return (
                <button key={kr} className={cls} onClick={() => applyAnswer(kr)} disabled={!!selected}>
                  <span className="choice-num">{i + 1}</span>
                  {kr}
                </button>
              )
            })}
          </div>

          {selected && (
            <>
              <div className={`result-msg ${selected === question.correctAnswer ? 'correct' : 'wrong'}`}>
                {selected === question.correctAnswer
                  ? `✅ Correct! +${lastPts} pts`
                  : `❌ Wrong! Answer: ${question.correctAnswer}`}
              </div>
              {question.khmerWord && (
                <div className="khmer-hint">🇰🇭 {question.khmerWord}</div>
              )}
            </>
          )}

          {selected && (
            <button className="btn-next" onClick={handleNext}>
              Next Question → <kbd>Enter</kbd>
            </button>
          )}

          <div className="keyboard-hint">
            Press 1–5 to choose · Enter for next
          </div>
        </>
      )}
    </div>
  )
}
