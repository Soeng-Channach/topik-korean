import { useState, useMemo, useRef } from 'react'
import { CATEGORIES } from '../data/words'

export default function ManageWords({ words, onAdd, onUpdate, onDelete, onReset, topik1 = [], topik2 = [] }) {
  // form state
  const [englishInput, setEnglishInput] = useState('')
  const [koreanInput, setKoreanInput] = useState('')
  const [categoryInput, setCategoryInput] = useState('Animals')
  const [editingId, setEditingId] = useState(null)
  // list state
  const [source, setSource] = useState('my')          // 'my' | 'topik1' | 'topik2'
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('english')
  const [sortDir, setSortDir] = useState('asc')
  const [filterCat, setFilterCat] = useState('All')
  // ui state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [toast, setToast] = useState(null)
  const fileInputRef = useRef(null)

  // ── helpers ────────────────────────────────────────────────
  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  function resetForm() {
    setEnglishInput('')
    setKoreanInput('')
    setCategoryInput('Animals')
    setEditingId(null)
  }

  function handleSave() {
    if (!englishInput.trim() || !koreanInput.trim()) {
      showToast('Please fill in both words.', 'error')
      return
    }
    if (editingId !== null) {
      onUpdate(editingId, { englishWord: englishInput.trim(), koreanWord: koreanInput.trim(), category: categoryInput })
      showToast('Word updated!')
    } else {
      onAdd({ englishWord: englishInput.trim(), koreanWord: koreanInput.trim(), category: categoryInput })
      showToast('Word added!')
    }
    resetForm()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave()
  }

  function handleEdit(word) {
    setEditingId(word.id)
    setEnglishInput(word.englishWord)
    setKoreanInput(word.koreanWord)
    setCategoryInput(word.category)
    setConfirmDeleteId(null)
  }

  function handleDeleteClick(id) {
    setConfirmDeleteId(prev => prev === id ? null : id)
  }

  function confirmDelete(id) {
    onDelete(id)
    if (editingId === id) resetForm()
    setConfirmDeleteId(null)
    showToast('Word deleted.', 'error')
  }

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  function handleSourceChange(s) {
    setSource(s)
    setSearch('')
    setFilterCat('All')
    setEditingId(null)
  }

  function handleExport() {
    const data = words.map(({ englishWord, koreanWord, category }) => ({ englishWord, koreanWord, category }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'korean-words.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!Array.isArray(data)) throw new Error()
        const valid = data.filter(w => typeof w.englishWord === 'string' && typeof w.koreanWord === 'string' && w.englishWord.trim() && w.koreanWord.trim())
        if (valid.length === 0) throw new Error()
        valid.forEach(w => onAdd({
          englishWord: w.englishWord.trim(),
          koreanWord: w.koreanWord.trim(),
          category: typeof w.category === 'string' && w.category.trim() ? w.category.trim() : 'General',
        }))
        showToast(`Imported ${valid.length} word${valid.length !== 1 ? 's' : ''}!`)
      } catch {
        showToast('Invalid file format.', 'error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ── derived data ───────────────────────────────────────────
  const sourceWords = source === 'topik1' ? topik1 : source === 'topik2' ? topik2 : words

  const allCategories = useMemo(() => {
    const cats = [...new Set(sourceWords.map(w => w.category))].sort()
    return ['All', ...cats]
  }, [sourceWords])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let result = sourceWords.filter(w =>
      (!q || w.englishWord.toLowerCase().includes(q) || w.koreanWord.includes(search)) &&
      (filterCat === 'All' || w.category === filterCat)
    )
    return [...result].sort((a, b) => {
      let va, vb
      switch (sortField) {
        case 'korean':   va = a.koreanWord;                vb = b.koreanWord;                break
        case 'category': va = a.category.toLowerCase();    vb = b.category.toLowerCase();    break
        default:         va = a.englishWord.toLowerCase(); vb = b.englishWord.toLowerCase()
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [sourceWords, search, filterCat, sortField, sortDir])

  const isTopik = source !== 'my'

  // ── render ─────────────────────────────────────────────────
  return (
    <div className="crud-grid">

      {/* ── Left column: form (only for My Words) ── */}
      <div className="form-section">
        {isTopik ? (
          <div className="topik-info-panel">
            <div className={`topik-info-badge ${source}`}>
              {source === 'topik1' ? 'TOPIK I' : 'TOPIK II'}
            </div>
            <p className="topik-info-desc">
              {source === 'topik1'
                ? 'Beginner vocabulary (Levels 1–2). These are read-only reference words.'
                : 'Intermediate / Advanced vocabulary (Levels 3–6). These are read-only reference words.'}
            </p>
            <div className="topik-stats">
              <div className="topik-stat">
                <span className="topik-stat-val">{sourceWords.length}</span>
                <span className="topik-stat-lbl">Total words</span>
              </div>
              <div className="topik-stat">
                <span className="topik-stat-val">{filtered.length}</span>
                <span className="topik-stat-lbl">Shown</span>
              </div>
            </div>
            <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => handleSourceChange('my')}>
              ← Back to My Words
            </button>
          </div>
        ) : (
          <>
            <div className="section-title">{editingId !== null ? '✏️ Edit Word' : 'Add New Word'}</div>
            <div className="form-card">
              <div className="form-group">
                <label>English Word</label>
                <input type="text" value={englishInput} onChange={e => setEnglishInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="e.g. Apple" />
              </div>
              <div className="form-group">
                <label>Korean Word</label>
                <input type="text" value={koreanInput} onChange={e => setKoreanInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="e.g. 사과" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={categoryInput} onChange={e => setCategoryInput(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="btn-row">
                <button className="btn-primary" onClick={handleSave}>
                  {editingId !== null ? 'Update Word' : 'Save Word'}
                </button>
                <button className="btn-secondary" onClick={resetForm}>Clear</button>
              </div>
            </div>

            <div className="io-row">
              <button className="btn-io" onClick={handleExport} title="Download word list as JSON">↓ Export</button>
              <button className="btn-io" onClick={() => fileInputRef.current?.click()} title="Import words from JSON file">↑ Import</button>
              <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportFile} />
            </div>

            {confirmReset ? (
              <div className="reset-confirm-bar">
                <span className="delete-confirm-label">Reset all words to defaults?</span>
                <button className="btn-confirm-yes" onClick={() => { onReset(); setConfirmReset(false); showToast('Reset to defaults.') }}>Reset</button>
                <button className="btn-confirm-no" onClick={() => setConfirmReset(false)}>Cancel</button>
              </div>
            ) : (
              <button className="btn-reset-defaults" onClick={() => setConfirmReset(true)}>↺ Reset to Defaults</button>
            )}
          </>
        )}
      </div>

      {/* ── Right column: list ── */}
      <div className="list-section">
        {/* Source tabs */}
        <div className="source-tabs">
          <button className={`source-tab${source === 'my' ? ' active' : ''}`} onClick={() => handleSourceChange('my')}>
            My Words <span className="source-count">{words.length}</span>
          </button>
          <button className={`source-tab topik1${source === 'topik1' ? ' active' : ''}`} onClick={() => handleSourceChange('topik1')}>
            TOPIK I <span className="source-count">{topik1.length}</span>
          </button>
          <button className={`source-tab topik2${source === 'topik2' ? ' active' : ''}`} onClick={() => handleSourceChange('topik2')}>
            TOPIK II <span className="source-count">{topik2.length}</span>
          </button>
        </div>

        <div className="list-header">
          <div className="section-title" style={{ marginBottom: 0 }}>
            {source === 'my' ? 'Word List' : source === 'topik1' ? 'TOPIK I Vocabulary' : 'TOPIK II Vocabulary'}
          </div>
          <span className="word-count-badge">
            {filtered.length !== sourceWords.length ? `${filtered.length}/` : ''}{sourceWords.length} word{sourceWords.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            style={{ paddingLeft: '2.2rem' }}
            placeholder="Search English or Korean…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="filter-row">
          <select className="filter-cat-select" value={filterCat} onChange={e => setFilterCat(e.target.value)} aria-label="Filter by category">
            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="sort-btns">
            {[['english', 'EN'], ['korean', 'KR'], ['category', 'Cat']].map(([field, label]) => (
              <button
                key={field}
                className={`sort-btn${sortField === field ? ' active' : ''}`}
                onClick={() => toggleSort(field)}
                aria-label={`Sort by ${field}`}
              >
                {label}{sortField === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
              </button>
            ))}
          </div>
        </div>

        <div id="wordList">
          {filtered.length === 0
            ? <div className="empty-msg">No words found.</div>
            : filtered.map((w, idx) => (
              <div
                key={isTopik ? idx : w.id}
                className={`word-item${!isTopik && editingId === w.id ? ' selected' : ''}${isTopik ? ` topik-item ${source}` : ''}`}
              >
                <span className="en">{w.englishWord}</span>
                <span className="kr">{w.koreanWord}</span>
                {w.khmerWord && <span className="km">{w.khmerWord}</span>}
                <span className="cat">{w.category}</span>
                {isTopik ? (
                  <span className={`topik-readonly-badge ${source}`}>
                    {source === 'topik1' ? 'T1' : 'T2'}
                  </span>
                ) : confirmDeleteId === w.id ? (
                  <div className="delete-confirm">
                    <span className="delete-confirm-label">Delete?</span>
                    <button className="btn-confirm-yes" onClick={() => confirmDelete(w.id)}>Yes</button>
                    <button className="btn-confirm-no" onClick={() => setConfirmDeleteId(null)}>No</button>
                  </div>
                ) : (
                  <div className="actions">
                    <button className="btn-edit" onClick={() => handleEdit(w)}>Edit</button>
                    <button className="btn-del" onClick={() => handleDeleteClick(w.id)} aria-label="Delete word">✕</button>
                  </div>
                )}
              </div>
            ))
          }
        </div>
      </div>

      {toast && <div className={`toast show ${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
