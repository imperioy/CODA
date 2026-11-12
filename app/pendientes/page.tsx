'use client'

import { useState } from 'react'
import { Search, X, ArrowRightLeft, Loader2, Trash2, Star } from 'lucide-react'
import { useBooks, Book } from '../context/BookContext'

export default function Pendientes() {
  const { books, addBook, updateBook, removeBook, t } = useBooks()
  const pend = t.pending

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [sortBy, setSortBy] = useState('recent')
  const [searchQuery, setSearchQuery] = useState('')
  
  const pendingBooks = books.filter(b => b.status === 'pendiente')

  const filteredBooks = pendingBooks.filter(b => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const titleMatch = b.title.toLowerCase().includes(q)
    const authorMatch = b.authors?.some(a => a.toLowerCase().includes(q))
    return titleMatch || authorMatch
  })

  const formatLabel = (fmt: string | undefined) => {
    if (!fmt) return fmt
    if (fmt === 'Físico') return pend.formatPhysical
    if (fmt === 'Audiolibro') return pend.formatAudiobook
    if (fmt === 'E-book') return pend.formatEbook
    return fmt
  }

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === 'title-asc') return a.title.localeCompare(b.title)
    if (sortBy === 'author-asc') return (a.authors[0] || '').localeCompare(b.authors[0] || '')
    if (sortBy === 'recent') return books.indexOf(b) - books.indexOf(a)
    if (sortBy === 'oldest') return books.indexOf(a) - books.indexOf(b)
    return 0
  })

  const searchBooks = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setIsSearching(true); setSearchError(''); setResults([])
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&key=${process.env.NEXT_PUBLIC_BOOKS_API_KEY}`)
      if (!res.ok) throw new Error('API Error')
      const data = await res.json()
      if (data.items && data.items.length > 0) setResults(data.items)
      else setSearchError(pend.apiNoResults || pend.noResults)
    } catch { setSearchError(pend.connectionError) } 
    finally { setIsSearching(false) }
  }

  const handleAdd = (apiBook: any, status: 'libreria' | 'pendiente') => {
    const info = apiBook.volumeInfo
    const newBook: Book = {
      id: apiBook.id, title: info.title, authors: info.authors || ['N/A'],
      thumbnail: (info.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=NA').replace(/^http:\/\//i, 'https://'),
      status: status, pageCount: info.pageCount || 0 
    }
    if (!books.find(b => b.id === newBook.id)) addBook(newBook)
    setResults([]); setQuery('')
  }

  const handleUpdate = (updates: Partial<Book>) => {
    if (selectedBook) {
      updateBook(selectedBook.id, updates)
      setSelectedBook({ ...selectedBook, ...updates })
    }
  }

  const handleDelete = () => {
    if (selectedBook) { removeBook(selectedBook.id); setSelectedBook(null) }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto relative">
      <form onSubmit={searchBooks} className="flex gap-2 relative">
        <input type="text" placeholder={pend.apiSearchPlaceholder || pend.searchPlaceholder} className="w-full p-3 rounded-xl border border-gray-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-neutral-900 dark:text-white" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button type="submit" disabled={isSearching} className="bg-amber-600 text-white p-3 rounded-xl hover:bg-amber-700 disabled:bg-amber-400 flex items-center justify-center min-w-[50px]">
          {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
        </button>
      </form>

      {searchError && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-900/50">{searchError}</div>}

      {results.length > 0 && (
        <div className="absolute top-14 left-0 right-0 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-100 dark:border-neutral-800 p-2 space-y-2 z-40">
          {results.map((book) => (
            <div key={book.id} className="flex gap-3 items-center p-2 border-b dark:border-neutral-800 last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded">
              <img src={book.volumeInfo.imageLinks?.smallThumbnail?.replace(/^http:\/\//i, 'https://') || 'https://via.placeholder.com/40x60?text=NA'} alt="Cover" className="w-12 h-16 object-cover rounded shadow-sm" />
              <div className="flex-1">
                <p className="font-semibold text-sm line-clamp-1 dark:text-white">{book.volumeInfo.title}</p>
                <p className="text-xs text-gray-500 dark:text-neutral-400 line-clamp-1">{book.volumeInfo.authors?.join(', ')}</p>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row">
                <button onClick={() => handleAdd(book, 'libreria')} className="text-[10px] sm:text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded">{pend.toLibrary}</button>
                <button onClick={() => handleAdd(book, 'pendiente')} className="text-[10px] sm:text-xs bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 px-2 py-1 rounded">{pend.toPending}</button>
              </div>
            </div>
          ))}
          <button onClick={() => setResults([])} className="w-full text-center text-sm text-gray-400 dark:text-neutral-500 pt-2">{pend.close}</button>
        </div>
      )}

      <div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white whitespace-nowrap">{pend.title} ({filteredBooks.length})</h2>
          
          <div className="relative flex-1 md:max-w-[200px] lg:max-w-xs">
            <input 
              type="text" 
              placeholder={pend.searchPlaceholder} 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:ring-2 focus:ring-amber-500 outline-none dark:text-white shadow-sm transition" 
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          <div className="flex items-center gap-2">
            <select className="p-2 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-200 shadow-sm w-max" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recent">{pend.sortRecent}</option>
              <option value="oldest">{pend.sortOldest}</option>
              <option value="title-asc">{pend.sortTitle}</option>
              <option value="author-asc">{pend.sortAuthor}</option>
            </select>
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="text-center p-10 bg-white dark:bg-neutral-900 rounded-xl border border-dashed border-gray-300 dark:border-neutral-700">
            <p className="text-gray-500 dark:text-neutral-400 text-sm">{searchQuery.trim() ? pend.noResults : pend.emptyState}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {sortedBooks.map((book) => (
              <div key={book.id} className="flex flex-col group cursor-pointer relative" onClick={() => setSelectedBook(book)}>
                <img src={book.thumbnail?.replace(/^http:\/\//i, 'https://')} alt={book.title} className="w-full aspect-[2/3] object-cover rounded-lg shadow-md mb-3 group-hover:scale-105 transition duration-200 grayscale-[20%]" />
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">{book.title}</p>
                <p className="text-xs text-gray-500 dark:text-neutral-400 line-clamp-1 mb-1">{book.authors.join(', ')}</p>
                <div className="flex justify-between items-center mt-1">
                  {book.rating !== undefined && book.rating !== null && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-bold text-gray-700 dark:text-neutral-300">{Math.round(Number(book.rating) * 100) / 100}</span>
                    </div>
                  )}
                  {book.format && (
                    <span className="text-[10px] bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 px-1.5 py-0.5 rounded border dark:border-neutral-700 w-max">
                      {formatLabel(book.format)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBook && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col transition-colors border dark:border-neutral-800">
            <div className="flex justify-between items-start p-4 border-b dark:border-neutral-800">
              <div className="flex gap-4 min-w-0">
                <img 
                  src={selectedBook.thumbnail?.replace(/^http:\/\//i, 'https://') || 'https://via.placeholder.com/128x192?text=NA'} 
                  alt="Cover" 
                  className="w-16 h-24 object-cover rounded shadow shrink-0" 
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128x192?text=NA' }}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-lg leading-tight dark:text-white line-clamp-2">{selectedBook.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1 line-clamp-1">{selectedBook.authors.join(', ')}</p>
                </div>
              </div>
              <button onClick={() => setSelectedBook(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full dark:text-neutral-400 shrink-0"><X size={24} /></button>
            </div>
            <div className="p-5 space-y-4 flex-1">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400 mb-1">{pend.bookTitle}</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-neutral-800 dark:text-white" 
                    value={selectedBook.title} 
                    onChange={(e) => handleUpdate({ title: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400 mb-1">{pend.coverUrl}</label>
                  <input 
                    type="text" 
                    placeholder={pend.coverPlaceholder} 
                    className="w-full p-2 border dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-neutral-800 dark:text-white" 
                    value={selectedBook.thumbnail} 
                    onChange={(e) => handleUpdate({ thumbnail: e.target.value, spineColor: undefined })} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">{pend.score} (0-10)</label>
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-500 shrink-0" size={18} fill={selectedBook.rating ? "currentColor" : "none"} />
                    <input 
                      type="number" 
                      min="0" 
                      max="10" 
                      step="0.01" 
                      className="w-full p-2 border dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-neutral-800 dark:text-white" 
                      value={selectedBook.rating !== undefined && selectedBook.rating !== null ? selectedBook.rating : ''} 
                      onChange={(e) => {
                        const valStr = e.target.value
                        if (valStr === '') {
                          handleUpdate({ rating: undefined })
                          return
                        }
                        let val = parseFloat(valStr)
                        if (isNaN(val)) return
                        if (val < 0) val = 0
                        if (val > 10) val = 10
                        val = Math.round(val * 100) / 100
                        handleUpdate({ rating: val })
                      }} 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">{pend.howToRead}</label>
                  <select className="w-full p-2 border dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-neutral-800 dark:text-white" value={selectedBook.format || ''} onChange={(e) => handleUpdate({ format: e.target.value as any })}>
                    <option value="">{pend.selectFormat}</option>
                    <option value="Físico">{pend.formatPhysical}</option>
                    <option value="E-book">{pend.formatEbook}</option>
                    <option value="Audiolibro">{pend.formatAudiobook}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">{pend.notes}</label>
                <textarea rows={3} className="w-full p-3 border dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none bg-white dark:bg-neutral-800 dark:text-white" placeholder={pend.notesPlaceholder} value={selectedBook.comment || ''} onChange={(e) => handleUpdate({ comment: e.target.value })} />
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-neutral-900 border-t dark:border-neutral-800 flex flex-wrap gap-2 rounded-b-2xl">
              <button onClick={handleDelete} className="flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition text-sm font-medium"><Trash2 size={18} /></button>
              <button onClick={() => { handleUpdate({ status: 'libreria' }); setSelectedBook(null) }} className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-200 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-700 transition text-sm font-medium"><ArrowRightLeft size={16} />{pend.moveToLibrary}</button>
              <button onClick={() => setSelectedBook(null)} className="flex-1 bg-amber-600 text-white py-2 rounded-xl hover:bg-amber-700 transition text-sm font-medium">{pend.save}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
