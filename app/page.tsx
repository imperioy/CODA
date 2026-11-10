'use client'

import { useState, useEffect } from 'react'
import { Search, X, ArrowRightLeft, Star, Calendar, Loader2, Trash2, BarChart2, BookOpen, Hash, TrendingUp, CalendarDays } from 'lucide-react'
import { useBooks, Book } from './context/BookContext'

export default function Libreria() {
  const { books, addBook, updateBook, removeBook, t } = useBooks()
  const lib = t.library

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showStats, setShowStats] = useState(false)
  const [sortBy, setSortBy] = useState('date-desc')
  
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [showDateFilter, setShowDateFilter] = useState(false)

  // Buscador local
  const [localQuery, setLocalQuery] = useState('')
  
  const myBooks = books.filter(b => b.status === 'libreria')

  const formatLabel = (fmt: string | undefined) => {
    if (!fmt) return fmt
    if (fmt === 'Físico') return lib.formatPhysical
    if (fmt === 'Audiolibro') return lib.formatAudiobook
    if (fmt === 'E-book') return lib.formatEbook
    return fmt
  }

  // Filtrado
  const filteredBooks = myBooks.filter(b => {
    if (filterStart || filterEnd) {
      if (!b.endDate) return false
      if (filterStart && b.endDate < filterStart) return false
      if (filterEnd && b.endDate > filterEnd) return false
    }
    if (localQuery) {
      const q = localQuery.toLowerCase();
      const titleMatch = b.title.toLowerCase().includes(q);
      const authorMatch = b.authors?.some(a => a.toLowerCase().includes(q));
      if (!titleMatch && !authorMatch) return false;
    }
    return true
  })

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === 'title-asc') return a.title.localeCompare(b.title)
    if (sortBy === 'author-asc') return (a.authors[0] || '').localeCompare(b.authors[0] || '')
    if (sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0)
    if (sortBy === 'date-desc') {
      if (!a.endDate) return 1; if (!b.endDate) return -1;
      return new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    }
    if (sortBy === 'date-asc') {
      if (!a.endDate) return 1; if (!b.endDate) return -1;
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    }
    return 0
  })

  const totalPages = filteredBooks.reduce((acc, book) => acc + (Number(book.pageCount) || 0), 0)
  const ratedBooks = filteredBooks.filter(b => b.rating)
  const avgRating = ratedBooks.length > 0 ? (ratedBooks.reduce((acc, book) => acc + (Number(book.rating) || 0), 0) / ratedBooks.length).toFixed(2) : '0.00'
    
  const [currentYear, setCurrentYear] = useState('')
  useEffect(() => { setCurrentYear(new Date().getFullYear().toString()) }, [])
  const booksThisYear = currentYear ? filteredBooks.filter(b => b.endDate && b.endDate.startsWith(currentYear)).length : 0
  
  const formats = filteredBooks.map(b => b.format).filter(Boolean) as string[]
  const favoriteFormat = formats.length > 0 ? formats.sort((a,b) => formats.filter(v => v===a).length - formats.filter(v => v===b).length).pop() : 'N/A'

  const searchBooks = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setIsSearching(true); setSearchError(''); setResults([])
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&key=${process.env.NEXT_PUBLIC_BOOKS_API_KEY}`)
      if (!res.ok) throw new Error('API Error')
      const data = await res.json()
      if (data.items && data.items.length > 0) setResults(data.items)
      else setSearchError(lib.noResults)
    } catch { setSearchError(lib.connectionError) } 
    finally { setIsSearching(false) }
  }

  const handleAdd = (apiBook: any, status: 'libreria' | 'pendiente') => {
    const info = apiBook.volumeInfo
    const newBook: Book = {
      id: apiBook.id, title: info.title, authors: info.authors || ['N/A'],
      thumbnail: info.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=NA',
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
        <input type="text" placeholder={lib.searchPlaceholder} className="w-full p-3 rounded-xl border border-gray-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-neutral-900 dark:text-white" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button type="submit" disabled={isSearching} className="bg-amber-600 text-white p-3 rounded-xl hover:bg-amber-700 disabled:bg-amber-400 flex items-center justify-center min-w-[50px]">
          {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
        </button>
      </form>
      {searchError && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-900/50">{searchError}</div>}

      {results.length > 0 && (
        <div className="absolute top-14 left-0 right-0 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-100 dark:border-neutral-800 p-2 space-y-2 z-40">
          {results.map((book) => (
            <div key={book.id} className="flex gap-3 items-center p-2 border-b dark:border-neutral-800 last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded">
              <img src={book.volumeInfo.imageLinks?.smallThumbnail || 'https://via.placeholder.com/40x60?text=NA'} alt="Cover" className="w-12 h-16 object-cover rounded shadow-sm" />
              <div className="flex-1">
                <p className="font-semibold text-sm line-clamp-1 dark:text-white">{book.volumeInfo.title}</p>
                <p className="text-xs text-gray-500 dark:text-neutral-400 line-clamp-1">{book.volumeInfo.authors?.join(', ')}</p>
                <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-0.5">{book.volumeInfo.pageCount ? `${book.volumeInfo.pageCount} ${lib.pages}` : ''}</p>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row">
                <button onClick={() => handleAdd(book, 'libreria')} className="text-[10px] sm:text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded">{lib.toLibrary}</button>
                <button onClick={() => handleAdd(book, 'pendiente')} className="text-[10px] sm:text-xs bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 px-2 py-1 rounded">{lib.toPending}</button>
              </div>
            </div>
          ))}
          <button onClick={() => setResults([])} className="w-full text-center text-sm text-gray-400 dark:text-neutral-500 pt-2">{lib.close}</button>
        </div>
      )}

      <div>
        {/* CABECERA DE LA LIBRERÍA CON EL BUSCADOR */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white whitespace-nowrap">{lib.title} ({filteredBooks.length})</h2>
          
          <div className="relative flex-1 md:max-w-[200px] lg:max-w-xs">
            <input 
              type="text" 
              placeholder={lib.filterPlaceholder} 
              value={localQuery} 
              onChange={e => setLocalQuery(e.target.value)} 
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:ring-2 focus:ring-amber-500 outline-none dark:text-white shadow-sm transition" 
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowDateFilter(!showDateFilter)} className={`p-2 rounded-lg transition shadow-sm border ${showDateFilter || filterStart || filterEnd ? 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/40 dark:border-amber-800 dark:text-amber-400' : 'bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 dark:border-neutral-700'}`}>
              <CalendarDays size={20} />
            </button>
            <select className="p-2 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-200 shadow-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date-desc">{lib.sortRecent}</option>
              <option value="date-asc">{lib.sortOldest}</option>
              <option value="rating-desc">{lib.sortRating}</option>
              <option value="title-asc">{lib.sortTitle}</option>
              <option value="author-asc">{lib.sortAuthor}</option>
            </select>
            <button onClick={() => setShowStats(true)} className="bg-gray-800 dark:bg-neutral-800 text-white p-2 rounded-lg hover:bg-gray-700 dark:hover:bg-neutral-700 transition shadow-sm flex items-center justify-center">
              <BarChart2 size={20} />
            </button>
          </div>
        </div>

        {showDateFilter && (
          <div className="flex flex-wrap items-center gap-3 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl mb-6 border border-amber-100 dark:border-amber-900/30">
            <span className="text-sm font-bold text-amber-900 dark:text-amber-400">{lib.period}</span>
            <div className="flex items-center gap-2">
              <input type="date" className="p-2 rounded-lg text-sm border dark:border-neutral-700 focus:ring-2 focus:ring-amber-500 outline-none dark:bg-neutral-900 dark:text-white" value={filterStart} onChange={e => setFilterStart(e.target.value)} />
              <span className="text-amber-800 dark:text-amber-500 font-medium">{lib.periodTo}</span>
              <input type="date" className="p-2 rounded-lg text-sm border dark:border-neutral-700 focus:ring-2 focus:ring-amber-500 outline-none dark:bg-neutral-900 dark:text-white" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} />
            </div>
            {(filterStart || filterEnd) && (
              <button onClick={() => {setFilterStart(''); setFilterEnd('')}} className="text-sm bg-white dark:bg-neutral-900 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition ml-auto">{lib.clearFilter}</button>
            )}
          </div>
        )}

        {filteredBooks.length === 0 ? (
          <div className="text-center p-10 bg-white dark:bg-neutral-900 rounded-xl border border-dashed border-gray-300 dark:border-neutral-700">
            <p className="text-gray-500 dark:text-neutral-400 text-sm">{lib.emptyState}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {sortedBooks.map((book) => (
              <div key={book.id} className="flex flex-col group cursor-pointer relative" onClick={() => setSelectedBook(book)}>
                {book.abandoned && <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 shadow">{lib.abandonedLabel}</span>}
                <img src={book.thumbnail} alt={book.title} className={`w-full aspect-[2/3] object-cover rounded-lg shadow-md mb-3 group-hover:scale-105 transition duration-200 ${book.abandoned ? 'opacity-60 grayscale-[50%]' : ''}`} />
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">{book.title}</p>
                <p className="text-xs text-gray-500 dark:text-neutral-400 line-clamp-1 mb-1">{book.authors.join(', ')}</p>
                <div className="flex justify-between items-center mt-1">
                  {book.rating !== undefined && book.rating !== null && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-bold text-gray-700 dark:text-neutral-300">{Math.round(Number(book.rating) * 100) / 100}</span>
                    </div>
                  )}
                  {book.format && <span className="text-[10px] bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 px-1.5 py-0.5 rounded border dark:border-neutral-700">{formatLabel(book.format)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showStats && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden transition-colors border dark:border-neutral-800">
            <div className="flex justify-between items-center p-4 bg-gray-800 dark:bg-neutral-950 text-white border-b dark:border-neutral-800">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <TrendingUp size={20}/> {filterStart || filterEnd ? lib.statsPeriod : lib.stats}
              </h3>
              <button onClick={() => setShowStats(false)} className="p-1 hover:bg-gray-700 dark:hover:bg-neutral-800 rounded-full transition"><X size={24} /></button>
            </div>
            <div className="bg-gray-50 dark:bg-neutral-900 p-4 border-b dark:border-neutral-800 flex flex-col sm:flex-row items-center gap-3 justify-center">
              <span className="text-sm font-bold text-gray-700 dark:text-neutral-300">{lib.period}</span>
              <div className="flex items-center gap-2">
                <input type="date" className="p-1.5 rounded-md text-sm border dark:border-neutral-700 outline-none focus:ring-2 focus:ring-amber-500 dark:bg-neutral-800 dark:text-white" value={filterStart} onChange={e => setFilterStart(e.target.value)} />
                <span className="text-gray-500 dark:text-neutral-500">-</span>
                <input type="date" className="p-1.5 rounded-md text-sm border dark:border-neutral-700 outline-none focus:ring-2 focus:ring-amber-500 dark:bg-neutral-800 dark:text-white" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} />
              </div>
              {(filterStart || filterEnd) && (
                <button onClick={() => {setFilterStart(''); setFilterEnd('')}} className="text-xs text-red-600 dark:text-red-400 hover:underline font-medium">{lib.clearFilter}</button>
              )}
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 flex flex-col items-center justify-center text-center">
                <BookOpen size={28} className="text-amber-500 dark:text-amber-400 mb-2" />
                <p className="text-3xl font-black text-amber-900 dark:text-amber-100">{filteredBooks.length}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase mt-1">{lib.totalBooks}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30 flex flex-col items-center justify-center text-center">
                <Hash size={28} className="text-green-500 dark:text-green-400 mb-2" />
                <p className="text-3xl font-black text-green-900 dark:text-green-100">{totalPages}</p>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase mt-1">{lib.totalPages}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 flex flex-col items-center justify-center text-center">
                <Calendar size={28} className="text-purple-500 dark:text-purple-400 mb-2" />
                <p className="text-3xl font-black text-purple-900 dark:text-purple-100">{filterStart || filterEnd ? filteredBooks.length : booksThisYear}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase mt-1">{filterStart || filterEnd ? lib.inPeriod : `${lib.readIn} ${currentYear}`}</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30 flex flex-col items-center justify-center text-center">
                <Star size={28} className="text-yellow-500 dark:text-yellow-400 mb-2" />
                <p className="text-3xl font-black text-yellow-900 dark:text-yellow-100">{avgRating}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium uppercase mt-1">{lib.avgRating}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-neutral-900 border-t dark:border-neutral-800 text-center text-sm text-gray-600 dark:text-neutral-400 flex justify-center items-center gap-2">
              {lib.favoriteFormat} <span className="font-bold text-gray-900 dark:text-white px-2 py-1 bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded-md shadow-sm">{formatLabel(favoriteFormat)}</span>
            </div>
          </div>
        </div>
      )}

      {selectedBook && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col transition-colors border dark:border-neutral-800">
            <div className="flex justify-between items-start p-4 border-b dark:border-neutral-800">
              <div className="flex gap-4 min-w-0">
                <img 
                  src={selectedBook.thumbnail || 'https://via.placeholder.com/128x192?text=NA'} 
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400 mb-1">{lib.bookTitle}</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-neutral-800 dark:text-white" 
                    value={selectedBook.title} 
                    onChange={(e) => handleUpdate({ title: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400 mb-1">{lib.coverUrl}</label>
                  <input 
                    type="text" 
                    placeholder={lib.coverPlaceholder} 
                    className="w-full p-2 border dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-neutral-800 dark:text-white" 
                    value={selectedBook.thumbnail} 
                    onChange={(e) => handleUpdate({ thumbnail: e.target.value, spineColor: undefined })} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">{lib.score} (0-10)</label>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">{lib.format}</label>
                  <select className="w-full p-2 border dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-neutral-800 dark:text-white" value={selectedBook.format || ''} onChange={(e) => handleUpdate({ format: e.target.value as any })}>
                    <option value="">{lib.selectFormat}</option>
                    <option value="Físico">{lib.formatPhysical}</option>
                    <option value="E-book">{lib.formatEbook}</option>
                    <option value="Audiolibro">{lib.formatAudiobook}</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer p-3 border dark:border-neutral-700 rounded-lg w-full bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 transition">
                  <input type="checkbox" className="w-5 h-5 text-red-600 rounded focus:ring-red-500 accent-red-600 dark:bg-neutral-900 dark:border-neutral-700" checked={selectedBook.abandoned || false} onChange={(e) => handleUpdate({ abandoned: e.target.checked })} />
                  <span className="text-sm font-medium text-gray-700 dark:text-neutral-200">{lib.abandonedLabel}</span>
                </label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">{lib.pages}</label>
                  <input type="number" className="w-full p-2 border dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-neutral-800 dark:text-white" value={selectedBook.pageCount || ''} onChange={(e) => handleUpdate({ pageCount: parseInt(e.target.value) || 0 })} placeholder="Nº" />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">{lib.startDate}</label>
                  <input type="date" className="w-full p-2 border dark:border-neutral-700 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-neutral-800 dark:text-white" value={selectedBook.startDate || ''} onChange={(e) => handleUpdate({ startDate: e.target.value })} />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">{lib.endDate}</label>
                  <input type="date" className="w-full p-2 border dark:border-neutral-700 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-neutral-800 dark:text-white" value={selectedBook.endDate || ''} onChange={(e) => handleUpdate({ endDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">{lib.comments}</label>
                <textarea rows={3} className="w-full p-3 border dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none bg-white dark:bg-neutral-800 dark:text-white" placeholder={lib.commentsPlaceholder} value={selectedBook.comment || ''} onChange={(e) => handleUpdate({ comment: e.target.value })} />
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-neutral-900 border-t dark:border-neutral-800 flex flex-wrap gap-2 rounded-b-2xl">
              <button onClick={handleDelete} className="flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition text-sm font-medium"><Trash2 size={18} /></button>
              <button onClick={() => { handleUpdate({ status: 'pendiente' }); setSelectedBook(null) }} className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-200 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-700 transition text-sm font-medium"><ArrowRightLeft size={16} />{lib.moveToPending}</button>
              <button onClick={() => setSelectedBook(null)} className="flex-1 bg-amber-600 text-white py-2 rounded-xl hover:bg-amber-700 transition text-sm font-medium">{lib.save}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
