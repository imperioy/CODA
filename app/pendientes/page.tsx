'use client'

import { useState } from 'react'
import { Search, X, ArrowRightLeft, Loader2, Trash2 } from 'lucide-react'
import { useBooks, Book } from '../context/BookContext'

const dict = {
  es: {
    search: "Busca un libro para leer...", noResults: "No hemos encontrado ningún libro.", error: "Error de conexión.", close: "Cerrar",
    toLib: "A Librería", toPend: "A Pendientes", pendTitle: "Próximas Lecturas", empty: "No tienes libros pendientes.",
    rec: "Añadidos recientemente", old: "Más antiguos primero", az: "Título (A-Z)", auth: "Autor (A-Z)",
    howRead: "¿Cómo lo quieres leer?", sel: "Sin decidir...", phys: "Físico", eb: "E-book", au: "Audiolibro",
    notes: "Notas previas (Opcional)", notesPl: "Ej. Me lo recomendó María...", save: "Cerrar", moveLib: "Mover a Librería"
  },
  en: {
    search: "Search for a book to read...", noResults: "No books found.", error: "Connection error.", close: "Close",
    toLib: "To Library", toPend: "To Pending", pendTitle: "Up Next", empty: "You have no pending books.",
    rec: "Recently added", old: "Oldest first", az: "Title (A-Z)", auth: "Author (A-Z)",
    howRead: "How do you want to read it?", sel: "Undecided...", phys: "Physical", eb: "E-book", au: "Audiobook",
    notes: "Previous notes (Optional)", notesPl: "E.g. Recommended by Maria...", save: "Close", moveLib: "Move to Library"
  },
  fr: {
    search: "Chercher un livre à lire...", noResults: "Aucun livre trouvé.", error: "Erreur de connexion.", close: "Fermer",
    toLib: "Vers Bibliothèque", toPend: "Vers À lire", pendTitle: "Prochaines Lectures", empty: "Vous n'avez pas de livres en attente.",
    rec: "Ajoutés récemment", old: "Plus anciens d'abord", az: "Titre (A-Z)", auth: "Auteur (A-Z)",
    howRead: "Comment voulez-vous le lire ?", sel: "Indécis...", phys: "Physique", eb: "E-book", au: "Livre audio",
    notes: "Notes préalables (Optionnel)", notesPl: "Ex. Recommandé par Marie...", save: "Fermer", moveLib: "Déplacer vers Bibliothèque"
  },
  pt: {
    search: "Buscar um livro para ler...", noResults: "Nenhum livro encontrado.", error: "Erro de conexão.", close: "Fechar",
    toLib: "Para Biblioteca", toPend: "Para Pendentes", pendTitle: "Próximas Leituras", empty: "Você não tem livros pendentes.",
    rec: "Adicionados recentemente", old: "Mais antigos primeiro", az: "Título (A-Z)", auth: "Autor (A-Z)",
    howRead: "Como você quer ler?", sel: "Indeciso...", phys: "Físico", eb: "E-book", au: "Audiolivro",
    notes: "Notas prévias (Opcional)", notesPl: "Ex. Recomendado pela Maria...", save: "Fechar", moveLib: "Mover para Biblioteca"
  },
  de: {
    search: "Buch zum Lesen suchen...", noResults: "Keine Bücher gefunden.", error: "Verbindungsfehler.", close: "Schließen",
    toLib: "Zur Bibliothek", toPend: "Zu Ausstehend", pendTitle: "Als Nächstes", empty: "Sie haben keine ausstehenden Bücher.",
    rec: "Kürzlich hinzugefügt", old: "Älteste zuerst", az: "Titel (A-Z)", auth: "Autor (A-Z)",
    howRead: "Wie möchtest du es lesen?", sel: "Noch unentschieden...", phys: "Physisch", eb: "E-Book", au: "Hörbuch",
    notes: "Vorherige Notizen (Optional)", notesPl: "Z.B. Empfohlen von Maria...", save: "Schließen", moveLib: "Zur Bibliothek verschieben"
  },
  it: {
    search: "Cerca un libro da leggere...", noResults: "Nessun libro trovato.", error: "Errore di connessione.", close: "Chiudi",
    toLib: "Nella Libreria", toPend: "In Coda", pendTitle: "Prossime Letture", empty: "Non hai libri in coda.",
    rec: "Aggiunti di recente", old: "I più vecchi prima", az: "Titolo (A-Z)", auth: "Autore (A-Z)",
    howRead: "Come vuoi leggerlo?", sel: "Indeciso...", phys: "Fisico", eb: "E-book", au: "Audiolibro",
    notes: "Note precedenti (Opzionale)", notesPl: "Es. Consigliato da Maria...", save: "Chiudi", moveLib: "Sposta nella Libreria"
  }
}

export default function Pendientes() {
  const { books, addBook, updateBook, removeBook, language } = useBooks()
  const t = dict[language] || dict.es
  
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [sortBy, setSortBy] = useState('recent')
  
  const pendingBooks = books.filter(b => b.status === 'pendiente')

  const sortedBooks = [...pendingBooks].sort((a, b) => {
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
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t.pendTitle} ({pendingBooks.length})</h2>
          <select className="p-2 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-200 shadow-sm w-max" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">{t.rec}</option>
            <option value="oldest">{t.old}</option>
            <option value="title-asc">{t.az}</option>
            <option value="author-asc">{t.auth}</option>
          </select>
        </div>

        {pendingBooks.length === 0 ? (
          <div className="text-center p-10 bg-white dark:bg-neutral-900 rounded-xl border border-dashed border-gray-300 dark:border-neutral-700">
            <p className="text-gray-500 dark:text-neutral-400 text-sm">{t.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {sortedBooks.map((book) => (
              <div key={book.id} className="flex flex-col group cursor-pointer relative" onClick={() => setSelectedBook(book)}>
                <img src={book.thumbnail} alt={book.title} className="w-full aspect-[2/3] object-cover rounded-lg shadow-md mb-3 group-hover:scale-105 transition duration-200 grayscale-[20%]" />
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">{book.title}</p>
                <p className="text-xs text-gray-500 dark:text-neutral-400 line-clamp-1 mb-1">{book.authors.join(', ')}</p>
                {book.format && (
                  <span className="text-[10px] bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 px-1.5 py-0.5 rounded border dark:border-neutral-700 w-max mt-1">
                    {book.format === 'Físico' ? t.phys : book.format === 'Audiolibro' ? t.au : book.format}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">{t.howRead}</label>
                <select className="w-full p-2 border dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-neutral-800 dark:text-white" value={selectedBook.format || ''} onChange={(e) => handleUpdate({ format: e.target.value as any })}>
                  <option value="">{t.sel}</option>
                  <option value="Físico">{t.phys}</option>
                  <option value="E-book">{t.eb}</option>
                  <option value="Audiolibro">{t.au}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">{t.notes}</label>
                <textarea rows={4} className="w-full p-3 border dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none bg-white dark:bg-neutral-800 dark:text-white" placeholder={t.notesPl} value={selectedBook.comment || ''} onChange={(e) => handleUpdate({ comment: e.target.value })} />
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-neutral-900 border-t dark:border-neutral-800 flex flex-wrap gap-2 rounded-b-2xl">
              <button onClick={handleDelete} className="flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition text-sm font-medium"><Trash2 size={18} /></button>
              <button onClick={() => { handleUpdate({ status: 'libreria' }); setSelectedBook(null) }} className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-200 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-700 transition text-sm font-medium"><ArrowRightLeft size={16} />{t.moveLib}</button>
              <button onClick={() => setSelectedBook(null)} className="flex-1 bg-amber-600 text-white py-2 rounded-xl hover:bg-amber-700 transition text-sm font-medium">{t.save}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}