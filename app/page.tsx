'use client'

import { useState, useEffect } from 'react'
import { Search, X, ArrowRightLeft, Star, Calendar, Loader2, Trash2, BarChart2, BookOpen, Hash, TrendingUp, CalendarDays } from 'lucide-react'
import { useBooks, Book } from './context/BookContext'

const dict = {
  es: {
    search: "Busca un título o autor...", noResults: "No hemos encontrado ningún libro.", error: "Error de conexión.", close: "Cerrar",
    toLib: "A Librería", toPend: "A Pendientes", libTitle: "Mi Librería", empty: "No hay libros con estas condiciones.",
    rec: "Más recientes", old: "Más antiguos", rate: "Mejor valorados", az: "Título (A-Z)", auth: "Autor (A-Z)",
    period: "Periodo:", to: "hasta", clear: "Limpiar", stats: "Estadísticas", statsPer: "Estad. del Periodo",
    totBooks: "Libros Totales", totPages: "Páginas Leídas", readIn: "Leídos en", inPer: "En el periodo", avg: "Nota Media",
    fav: "Formato favorito:", score: "Puntuación", format: "Formato", sel: "Selecciona...", phys: "Físico", eb: "E-book", au: "Audiolibro",
    abandon: "He abandonado este libro", pages: "Páginas", start: "Inicio", end: "Fin", comm: "Tus comentarios",
    commPl: "¿Qué te pareció?", save: "Guardar", movePend: "Mover a Pendientes"
  },
  en: {
    search: "Search title or author...", noResults: "No books found.", error: "Connection error.", close: "Close",
    toLib: "To Library", toPend: "To Pending", libTitle: "My Library", empty: "No books match these conditions.",
    rec: "Newest first", old: "Oldest first", rate: "Top rated", az: "Title (A-Z)", auth: "Author (A-Z)",
    period: "Time period:", to: "to", clear: "Clear", stats: "Your Stats", statsPer: "Period Stats",
    totBooks: "Total Books", totPages: "Pages Read", readIn: "Read in", inPer: "In period", avg: "Average Rating",
    fav: "Favorite format:", score: "Rating", format: "Format", sel: "Select...", phys: "Physical", eb: "E-book", au: "Audiobook",
    abandon: "I abandoned this book", pages: "Pages", start: "Start", end: "End", comm: "Your comments",
    commPl: "What did you think?", save: "Save", movePend: "Move to Pending"
  },
  fr: {
    search: "Rechercher un titre ou un auteur...", noResults: "Aucun livre trouvé.", error: "Erreur de connexion.", close: "Fermer",
    toLib: "Vers Bibliothèque", toPend: "Vers À lire", libTitle: "Ma Bibliothèque", empty: "Aucun livre ne correspond.",
    rec: "Plus récents", old: "Plus anciens", rate: "Mieux notés", az: "Titre (A-Z)", auth: "Auteur (A-Z)",
    period: "Période :", to: "à", clear: "Effacer", stats: "Statistiques", statsPer: "Stats de la Période",
    totBooks: "Livres Totaux", totPages: "Pages Lues", readIn: "Lus en", inPer: "Dans la période", avg: "Note Moyenne",
    fav: "Format favori :", score: "Note", format: "Format", sel: "Sélectionner...", phys: "Physique", eb: "E-book", au: "Livre audio",
    abandon: "J'ai abandonné ce livre", pages: "Pages", start: "Début", end: "Fin", comm: "Vos commentaires",
    commPl: "Qu'en avez-vous pensé ?", save: "Enregistrer", movePend: "Déplacer vers À lire"
  },
  pt: {
    search: "Buscar título ou autor...", noResults: "Nenhum livro encontrado.", error: "Erro de conexão.", close: "Fechar",
    toLib: "Para Biblioteca", toPend: "Para Pendentes", libTitle: "Minha Biblioteca", empty: "Nenhum livro corresponde.",
    rec: "Mais recentes", old: "Mais antigos", rate: "Melhor avaliados", az: "Título (A-Z)", auth: "Autor (A-Z)",
    period: "Período:", to: "até", clear: "Limpar", stats: "Estatísticas", statsPer: "Estatísticas do Período",
    totBooks: "Total de Livros", totPages: "Páginas Lidas", readIn: "Lidos em", inPer: "No período", avg: "Nota Média",
    fav: "Formato favorito:", score: "Nota", format: "Formato", sel: "Selecionar...", phys: "Físico", eb: "E-book", au: "Audiolivro",
    abandon: "Abandonei este livro", pages: "Páginas", start: "Início", end: "Fim", comm: "Seus comentários",
    commPl: "O que você achou?", save: "Salvar", movePend: "Mover para Pendentes"
  },
  de: {
    search: "Titel oder Autor suchen...", noResults: "Keine Bücher gefunden.", error: "Verbindungsfehler.", close: "Schließen",
    toLib: "Zur Bibliothek", toPend: "Zu Ausstehend", libTitle: "Meine Bibliothek", empty: "Keine Bücher gefunden.",
    rec: "Neueste", old: "Älteste", rate: "Am besten bewertet", az: "Titel (A-Z)", auth: "Autor (A-Z)",
    period: "Zeitraum:", to: "bis", clear: "Löschen", stats: "Statistiken", statsPer: "Zeitraum-Statistiken",
    totBooks: "Gesamte Bücher", totPages: "Gelesene Seiten", readIn: "Gelesen in", inPer: "Im Zeitraum", avg: "Durchschnittsnote",
    fav: "Lieblingsformat:", score: "Bewertung", format: "Format", sel: "Auswählen...", phys: "Physisch", eb: "E-Book", au: "Hörbuch",
    abandon: "Ich habe dieses Buch abgebrochen", pages: "Seiten", start: "Start", end: "Ende", comm: "Deine Kommentare",
    commPl: "Wie fandest du es?", save: "Speichern", movePend: "Zu Ausstehend verschieben"
  },
  it: {
    search: "Cerca titolo o autore...", noResults: "Nessun libro trovato.", error: "Errore di connessione.", close: "Chiudi",
    toLib: "Nella Libreria", toPend: "In Coda", libTitle: "La Mia Libreria", empty: "Nessun libro corrisponde.",
    rec: "Più recenti", old: "Più vecchi", rate: "Più votati", az: "Titolo (A-Z)", auth: "Autore (A-Z)",
    period: "Periodo:", to: "a", clear: "Pulisci", stats: "Statistiche", statsPer: "Statistiche del Periodo",
    totBooks: "Libri Totali", totPages: "Pagine Lette", readIn: "Letti nel", inPer: "Nel periodo", avg: "Voto Medio",
    fav: "Formato preferito:", score: "Voto", format: "Formato", sel: "Seleziona...", phys: "Fisico", eb: "E-book", au: "Audiolibro",
    abandon: "Ho abbandonato questo libro", pages: "Pagine", start: "Inizio", end: "Fine", comm: "I tuoi commenti",
    commPl: "Cosa ne pensi?", save: "Salva", movePend: "Sposta in Coda"
  }
}

export default function Libreria() {
  const { books, addBook, updateBook, removeBook, language } = useBooks()
  const t = dict[language] || dict.es
  
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
  
  const myBooks = books.filter(b => b.status === 'libreria')

  const filteredBooks = myBooks.filter(b => {
    if (filterStart || filterEnd) {
      if (!b.endDate) return false
      if (filterStart && b.endDate < filterStart) return false
      if (filterEnd && b.endDate > filterEnd) return false
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
      else setSearchError(t.noResults)
    } catch { setSearchError(t.error) } 
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
        <input type="text" placeholder={t.search} className="w-full p-3 rounded-xl border border-gray-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-neutral-900 dark:text-white" value={query} onChange={(e) => setQuery(e.target.value)} />
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
                <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-0.5">{book.volumeInfo.pageCount ? `${book.volumeInfo.pageCount} ${t.pages}` : ''}</p>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row">
                <button onClick={() => handleAdd(book, 'libreria')} className="text-[10px] sm:text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded">{t.toLib}</button>
                <button onClick={() => handleAdd(book, 'pendiente')} className="text-[10px] sm:text-xs bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 px-2 py-1 rounded">{t.toPend}</button>
              </div>
            </div>
          ))}
          <button onClick={() => setResults([])} className="w-full text-center text-sm text-gray-400 dark:text-neutral-500 pt-2">{t.close}</button>
        </div>
      )}

      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t.libTitle} ({filteredBooks.length})</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowDateFilter(!showDateFilter)} className={`p-2 rounded-lg transition shadow-sm border ${showDateFilter || filterStart || filterEnd ? 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/40 dark:border-amber-800 dark:text-amber-400' : 'bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 dark:border-neutral-700'}`}>
              <CalendarDays size={20} />
            </button>
            <select className="p-2 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-200 shadow-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date-desc">{t.rec}</option>
              <option value="date-asc">{t.old}</option>
              <option value="rating-desc">{t.rate}</option>
              <option value="title-asc">{t.az}</option>
              <option value="author-asc">{t.auth}</option>
            </select>
            <button onClick={() => setShowStats(true)} className="bg-gray-800 dark:bg-neutral-800 text-white p-2 rounded-lg hover:bg-gray-700 dark:hover:bg-neutral-700 transition shadow-sm flex items-center justify-center">
              <BarChart2 size={20} />
            </button>
          </div>
        </div>

        {showDateFilter && (
          <div className="flex flex-wrap items-center gap-3 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl mb-6 border border-amber-100 dark:border-amber-900/30">
            <span className="text-sm font-bold text-amber-900 dark:text-amber-400">{t.period}</span>
            <div className="flex items-center gap-2">
              <input type="date" className="p-2 rounded-lg text-sm border dark:border-neutral-700 focus:ring-2 focus:ring-amber-500 outline-none dark:bg-neutral-900 dark:text-white" value={filterStart} onChange={e => setFilterStart(e.target.value)} />
              <span className="text-amber-800 dark:text-amber-500 font-medium">{t.to}</span>
              <input type="date" className="p-2 rounded-lg text-sm border dark:border-neutral-700 focus:ring-2 focus:ring-amber-500 outline-none dark:bg-neutral-900 dark:text-white" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} />
            </div>
            {(filterStart || filterEnd) && (
              <button onClick={() => {setFilterStart(''); setFilterEnd('')}} className="text-sm bg-white dark:bg-neutral-900 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition ml-auto">{t.clear}</button>
            )}
          </div>
        )}

        {filteredBooks.length === 0 ? (
          <div className="text-center p-10 bg-white dark:bg-neutral-900 rounded-xl border border-dashed border-gray-300 dark:border-neutral-700">
            <p className="text-gray-500 dark:text-neutral-400 text-sm">{t.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {sortedBooks.map((book) => (
              <div key={book.id} className="flex flex-col group cursor-pointer relative" onClick={() => setSelectedBook(book)}>
                {book.abandoned && <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 shadow">{t.abandon}</span>}
                <img src={book.thumbnail} alt={book.title} className={`w-full aspect-[2/3] object-cover rounded-lg shadow-md mb-3 group-hover:scale-105 transition duration-200 ${book.abandoned ? 'opacity-60 grayscale-[50%]' : ''}`} />
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">{book.title}</p>
                <p className="text-xs text-gray-500 dark:text-neutral-400 line-clamp-1 mb-1">{book.authors.join(', ')}</p>
                <div className="flex justify-between items-center mt-1">
                  {book.rating !== undefined && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-bold text-gray-700 dark:text-neutral-300">{Number(book.rating).toFixed(2)}</span>
                    </div>
                  )}
                  {book.format && <span className="text-[10px] bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 px-1.5 py-0.5 rounded border dark:border-neutral-700">{book.format === 'Físico' ? t.phys : book.format === 'Audiolibro' ? t.au : book.format}</span>}
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
                <TrendingUp size={20}/> {filterStart || filterEnd ? t.statsPer : t.stats}
              </h3>
              <button onClick={() => setShowStats(false)} className="p-1 hover:bg-gray-700 dark:hover:bg-neutral-800 rounded-full transition"><X size={24} /></button>
            </div>
            <div className="bg-gray-50 dark:bg-neutral-900 p-4 border-b dark:border-neutral-800 flex flex-col sm:flex-row items-center gap-3 justify-center">
              <span className="text-sm font-bold text-gray-700 dark:text-neutral-300">{t.period}</span>
              <div className="flex items-center gap-2">
                <input type="date" className="p-1.5 rounded-md text-sm border dark:border-neutral-700 outline-none focus:ring-2 focus:ring-amber-500 dark:bg-neutral-800 dark:text-white" value={filterStart} onChange={e => setFilterStart(e.target.value)} />
                <span className="text-gray-500 dark:text-neutral-500">-</span>
                <input type="date" className="p-1.5 rounded-md text-sm border dark:border-neutral-700 outline-none focus:ring-2 focus:ring-amber-500 dark:bg-neutral-800 dark:text-white" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} />
              </div>
              {(filterStart || filterEnd) && (
                <button onClick={() => {setFilterStart(''); setFilterEnd('')}} className="text-xs text-red-600 dark:text-red-400 hover:underline font-medium">{t.clear}</button>
              )}
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 flex flex-col items-center justify-center text-center">
                <BookOpen size={28} className="text-amber-500 dark:text-amber-400 mb-2" />
                <p className="text-3xl font-black text-amber-900 dark:text-amber-100">{filteredBooks.length}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase mt-1">{t.totBooks}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30 flex flex-col items-center justify-center text-center">
                <Hash size={28} className="text-green-500 dark:text-green-400 mb-2" />
                <p className="text-3xl font-black text-green-900 dark:text-green-100">{totalPages}</p>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase mt-1">{t.totPages}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 flex flex-col items-center justify-center text-center">
                <Calendar size={28} className="text-purple-500 dark:text-purple-400 mb-2" />
                <p className="text-3xl font-black text-purple-900 dark:text-purple-100">{filterStart || filterEnd ? filteredBooks.length : booksThisYear}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase mt-1">{filterStart || filterEnd ? t.inPer : `${t.readIn} ${currentYear}`}</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30 flex flex-col items-center justify-center text-center">
                <Star size={28} className="text-yellow-500 dark:text-yellow-400 mb-2" />
                <p className="text-3xl font-black text-yellow-900 dark:text-yellow-100">{avgRating}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium uppercase mt-1">{t.avg}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-neutral-900 border-t dark:border-neutral-800 text-center text-sm text-gray-600 dark:text-neutral-400 flex justify-center items-center gap-2">
              {t.fav} <span className="font-bold text-gray-900 dark:text-white px-2 py-1 bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded-md shadow-sm">{favoriteFormat === 'Físico' ? t.phys : favoriteFormat === 'Audiolibro' ? t.au : favoriteFormat}</span>
            </div>
          </div>
        </div>
      )}

      {selectedBook && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col transition-colors border dark:border-neutral-800">
            <div className="flex justify-between items-start p-4 border-b dark:border-neutral-800">
              <div className="flex gap-4">
                <img src={selectedBook.thumbnail} alt="Cover" className="w-16 h-24 object-cover rounded shadow" />
                <div>
                  <h3 className="font-bold text-lg leading-tight dark:text-white">{selectedBook.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-neutral-400">{selectedBook.authors.join(', ')}</p>
                </div>
              </div>
              <button onClick={() => setSelectedBook(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full dark:text-neutral-400"><X size={24} /></button>
            </div>
            <div className="p-5 space-y-5 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">{t.score}</label>
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-500 shrink-0" fill={selectedBook.rating ? "currentColor" : "none"} />
                    <input type="number" min="0" max="10" step="0.01" className="w-full p-2 border dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-neutral-800 dark:text-white" value={selectedBook.rating || ''} onChange={(e) => handleUpdate({ rating: parseFloat(e.target.value) })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">{t.format}</label>
                  <select className="w-full p-2 border dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-neutral-800 dark:text-white" value={selectedBook.format || ''} onChange={(e) => handleUpdate({ format: e.target.value as any })}>
                    <option value="">{t.sel}</option>
                    <option value="Físico">{t.phys}</option>
                    <option value="E-book">{t.eb}</option>
                    <option value="Audiolibro">{t.au}</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer p-3 border dark:border-neutral-700 rounded-lg w-full bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 transition">
                  <input type="checkbox" className="w-5 h-5 text-red-600 rounded focus:ring-red-500 accent-red-600 dark:bg-neutral-900 dark:border-neutral-700" checked={selectedBook.abandoned || false} onChange={(e) => handleUpdate({ abandoned: e.target.checked })} />
                  <span className="text-sm font-medium text-gray-700 dark:text-neutral-200">{t.abandon}</span>
                </label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">{t.pages}</label>
                  <input type="number" className="w-full p-2 border dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-neutral-800 dark:text-white" value={selectedBook.pageCount || ''} onChange={(e) => handleUpdate({ pageCount: parseInt(e.target.value) || 0 })} placeholder="Nº" />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">{t.start}</label>
                  <input type="date" className="w-full p-2 border dark:border-neutral-700 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-neutral-800 dark:text-white" value={selectedBook.startDate || ''} onChange={(e) => handleUpdate({ startDate: e.target.value })} />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">{t.end}</label>
                  <input type="date" className="w-full p-2 border dark:border-neutral-700 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-neutral-800 dark:text-white" value={selectedBook.endDate || ''} onChange={(e) => handleUpdate({ endDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">{t.comm}</label>
                <textarea rows={3} className="w-full p-3 border dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none bg-white dark:bg-neutral-800 dark:text-white" placeholder={t.commPl} value={selectedBook.comment || ''} onChange={(e) => handleUpdate({ comment: e.target.value })} />
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-neutral-900 border-t dark:border-neutral-800 flex flex-wrap gap-2 rounded-b-2xl">
              <button onClick={handleDelete} className="flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition text-sm font-medium"><Trash2 size={18} /></button>
              <button onClick={() => { handleUpdate({ status: 'pendiente' }); setSelectedBook(null) }} className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-200 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-700 transition text-sm font-medium"><ArrowRightLeft size={16} />{t.movePend}</button>
              <button onClick={() => setSelectedBook(null)} className="flex-1 bg-amber-600 text-white py-2 rounded-xl hover:bg-amber-700 transition text-sm font-medium">{t.save}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}