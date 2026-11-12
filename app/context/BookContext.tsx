'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { translations, Language } from '@/lib/translations'

export type { Language }

export type WallStyle =
  | 'ladrillo_clasico'
  | 'ladrillo_vines'
  | 'papel_vintage'
  | 'listones_madera'
  | 'hormigon'
  | string;

export type BookcaseStyle =
  | 'oscura'
  | 'blanco'
  | 'metal'
  | 'madera'
  | 'clara'
  | string;

export type ShelfStyle =
  | 'futurista'
  | 'hexagonal'
  | 'terror'
  | 'gotico'
  | 'noble'
  | 'marmol'
  | 'normal'
  | 'lava'
  | 'cosmos'
  | 'dragon'
  | string;

export type Shelf = {
  id: string;
  name: string;
  style: ShelfStyle;
}

export type Book = {
  id: string;
  title: string;
  authors: string[];
  thumbnail: string;
  status: 'libreria' | 'pendiente';
  rating?: number;
  comment?: string;
  startDate?: string;
  endDate?: string;
  format?: 'Físico' | 'Audiolibro' | 'E-book';
  abandoned?: boolean;
  pageCount?: number;
  shelfId?: string;
  spineColor?: string;
  spineFontSize?: number;
  shelfOrder?: number;
}

type BookContextType = {
  books: Book[];
  addBook: (book: Book) => void;
  updateBook: (id: string, updatedBook: Partial<Book>) => void;
  removeBook: (id: string) => void;
  shelves: Shelf[];
  setShelves: React.Dispatch<React.SetStateAction<Shelf[]>>;
  addShelf: (name: string, style: ShelfStyle) => void;
  updateShelf: (id: string, updates: Partial<Shelf>) => void;
  removeShelf: (id: string) => void;
  wallStyle: WallStyle;
  setWallStyle: (style: WallStyle) => void;
  bookcaseStyle: BookcaseStyle;
  setBookcaseStyle: (style: BookcaseStyle) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: typeof translations['es']
}

export const sanitizeRating = (val?: number | null): number | undefined => {
  if (val === undefined || val === null || isNaN(val)) return undefined
  const clamped = Math.max(0, Math.min(10, val))
  return Math.round(clamped * 100) / 100
}

const BookContext = createContext<BookContextType | undefined>(undefined)

export function BookProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([])
  const [shelves, setShelves] = useState<Shelf[]>([])
  const [wallStyle, setWallStyle] = useState<WallStyle>('ladrillo_clasico')
  const [bookcaseStyle, setBookcaseStyle] = useState<BookcaseStyle>('oscura')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [language, setLanguage] = useState<Language>('es')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedBooks = localStorage.getItem('Coda-data')
    if (savedBooks) {
      try {
        const parsed: Book[] = JSON.parse(savedBooks)
        setBooks(parsed.map(b => ({ ...b, rating: sanitizeRating(b.rating) })))
      } catch (e) {
        console.error(e)
      }
    }
    const savedShelves = localStorage.getItem('Coda-shelves'); if (savedShelves) setShelves(JSON.parse(savedShelves))
    const savedWall = localStorage.getItem('Coda-wall') as WallStyle; if (savedWall) setWallStyle(savedWall)
    const savedBookcase = localStorage.getItem('Coda-bookcase') as BookcaseStyle; if (savedBookcase) setBookcaseStyle(savedBookcase)
    const savedTheme = localStorage.getItem('Coda-theme') as 'light' | 'dark'; if (savedTheme) setTheme(savedTheme)
    const savedLang = localStorage.getItem('Coda-lang') as Language; if (savedLang) setLanguage(savedLang)
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('Coda-data', JSON.stringify(books))
      localStorage.setItem('Coda-shelves', JSON.stringify(shelves))
      localStorage.setItem('Coda-wall', wallStyle)
      localStorage.setItem('Coda-bookcase', bookcaseStyle)
      localStorage.setItem('Coda-theme', theme)
      localStorage.setItem('Coda-lang', language)
    }
  }, [books, shelves, wallStyle, bookcaseStyle, theme, language, isLoaded])

  const addBook = (book: Book) => setBooks(prev => [...prev, { ...book, rating: sanitizeRating(book.rating) }])
  const updateBook = (id: string, updatedBook: Partial<Book>) => setBooks(prev => prev.map(b => {
    if (b.id !== id) return b
    return {
      ...b,
      ...updatedBook,
      ...(updatedBook.rating !== undefined ? { rating: sanitizeRating(updatedBook.rating) } : {})
    }
  }))
  const removeBook = (id: string) => setBooks(prev => prev.filter(b => b.id !== id))
  
  const addShelf = (name: string, style: ShelfStyle = 'normal') => {
    const newShelf: Shelf = { id: Date.now().toString(), name, style }
    setShelves(prev => [...prev, newShelf])
  }
  const updateShelf = (id: string, updates: Partial<Shelf>) => setShelves(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  const removeShelf = (id: string) => {
    setShelves(prev => prev.filter(s => s.id !== id))
    setBooks(prev => prev.map(b => b.shelfId === id ? { ...b, shelfId: undefined } : b))
  }
  
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')
  const changeLanguage = (lang: Language) => setLanguage(lang)

  const t = translations[language] || translations.es

  return (
    <BookContext.Provider value={{ books, addBook, updateBook, removeBook, shelves, setShelves, addShelf, updateShelf, removeShelf, wallStyle, setWallStyle, bookcaseStyle, setBookcaseStyle, theme, toggleTheme, language, changeLanguage, t }}>
      {children}
    </BookContext.Provider>
  )
}

export const useBooks = () => {
  const context = useContext(BookContext)
  if (!context) throw new Error('useBooks error')
  return context
}
