import { useState, useEffect, useCallback } from 'react'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateQuestion(words) {
  if (words.length < 5) return null
  const shuffled = shuffle(words)
  const correct = shuffled[0]
  const choices = shuffle([
    correct.koreanWord,
    shuffled[1].koreanWord,
    shuffled[2].koreanWord,
    shuffled[3].koreanWord,
    shuffled[4].koreanWord,
  ])
  return { englishWord: correct.englishWord, category: correct.category, correctAnswer: correct.koreanWord, choices }
}

export default function Game({ words }) {
  const [question, setQuestion] = useState(null)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [round, setRound] = useState(1)

  const nextQuestion = useCallback(() => {
    setQuestion(generateQuestion(words))
    setSelected(null)
  }, [words])

  useEffect(() => { nextQuestion() }, [nextQuestion])

  function handleChoice(kr) {
    if (selected) return
    setSelected(kr)
    if (kr === question.correctAnswer) {
      const pts = 10 + streak * 2
      setScore(s => s + pts)
      setStreak(s => s + 1)
    } else {
      setStreak(0)
    }
  }

  function handleNext() {
    setRound(r => r + 1)
    nextQuestion()
  }

  if (words.length < 5) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>
          Please add at least 5 words in the Manage Words tab to play.
        </p>
      </div>
    )
  }

  return (
    <div className="game-wrap">
      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-chip">
          <span>Score</span>
          <span className="stat-val gold">{score}</span>
        </div>
        <div className="stat-chip">
          <span>Streak</span>
          <span className="stat-val cyan">{streak}</span>
          <span>🔥</span>
        </div>
        <div className="stat-chip">
          <span>Round</span>
          <span className="stat-val violet">{round}</span>
        </div>
      </div>

      {/* Word card */}
      {question && (
        <>
          <div className="english-word-card">
            <div className="card-label">Translate to Korean</div>
            <div className="word">{question.englishWord}</div>
            <div className="word-category-badge">{question.category}</div>
          </div>

          <div className="choices-label">Choose the correct Korean meaning</div>

          <div className="choices">
            {question.choices.map((kr) => {
              let cls = 'choice-btn'
              if (selected) {
                if (kr === question.correctAnswer) cls += ' correct'
                else if (kr === selected) cls += ' wrong'
              }
              return (
                <button key={kr} className={cls} onClick={() => handleChoice(kr)} disabled={!!selected}>
                  {kr}
                </button>
              )
            })}
          </div>

          {selected && (
            <div className={`result-msg ${selected === question.correctAnswer ? 'correct' : 'wrong'}`}>
              {selected === question.correctAnswer
                ? `✅ Correct! +${10 + (streak - 1) * 2} pts`
                : `❌ Wrong! Answer: ${question.correctAnswer}`}
            </div>
          )}

          {selected && (
            <button className="btn-next" onClick={handleNext}>Next Question →</button>
          )}
        </>
      )}
    </div>
  )
}
