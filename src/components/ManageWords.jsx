import { useState } from 'react'
import { CATEGORIES } from '../data/words'

export default function ManageWords({ words, onAdd, onUpdate, onDelete }) {
  const [englishInput, setEnglishInput] = useState('')
  const [koreanInput, setKoreanInput] = useState('')
  const [categoryInput, setCategoryInput] = useState('Animals')
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

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

  function handleEdit(word) {
    setEditingId(word.id)
    setEnglishInput(word.englishWord)
    setKoreanInput(word.koreanWord)
    setCategoryInput(word.category)
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this word?')) return
    onDelete(id)
    if (editingId === id) resetForm()
    showToast('Word deleted.', 'error')
  }

  const q = search.toLowerCase()
  const filtered = q
    ? words.filter(w => w.englishWord.toLowerCase().includes(q) || w.koreanWord.includes(search))
    : words

  return (
    <div className="crud-grid">
      {/* Form */}
      <div className="form-section">
        <div className="section-title">{editingId !== null ? '✏️ Edit Word' : 'Add New Word'}</div>
        <div className="form-card">
          <div className="form-group">
            <label>English Word</label>
            <input type="text" value={englishInput} onChange={e => setEnglishInput(e.target.value)} placeholder="e.g. Apple" />
          </div>
          <div className="form-group">
            <label>Korean Word</label>
            <input type="text" value={koreanInput} onChange={e => setKoreanInput(e.target.value)} placeholder="e.g. 사과" />
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
      </div>

      {/* List */}
      <div className="list-section">
        <div className="list-header">
          <div className="section-title" style={{ marginBottom: 0 }}>Word List</div>
          <span className="word-count-badge">{filtered.length} word{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            style={{ paddingLeft: '2.2rem' }}
            placeholder="Search English or Korean…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div id="wordList">
          {filtered.length === 0
            ? <div className="empty-msg">No words found.</div>
            : filtered.map(w => (
              <div key={w.id} className={`word-item${editingId === w.id ? ' selected' : ''}`}>
                <span className="en">{w.englishWord}</span>
                <span className="kr">{w.koreanWord}</span>
                <span className="cat">{w.category}</span>
                <div className="actions">
                  <button className="btn-edit" onClick={() => handleEdit(w)}>Edit</button>
                  <button className="btn-del" onClick={() => handleDelete(w.id)}>✕</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast show ${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  )
}
