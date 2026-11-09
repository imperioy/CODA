'use client'

import { createContext, useContext, useState, useEffect } from 'react'

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
}

export type Language = 'es' | 'en' | 'fr' | 'pt' | 'de' | 'it';

type BookContextType = {
  books: Book[];
  addBook: (book: Book) => void;
  updateBook: (id: string, updatedBook: Partial<Book>) => void;
  removeBook: (id: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: Language;
  changeLanguage: (lang: Language) => void;
}

const BookContext = createContext<BookContextType | undefined>(undefined)

export function BookProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([])
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [language, setLanguage] = useState<Language>('es')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedBooks = localStorage.getItem('mis-libros-data')
    if (savedBooks) setBooks(JSON.parse(savedBooks))
    const savedTheme = localStorage.getItem('mis-libros-theme') as 'light' | 'dark'
    if (savedTheme) setTheme(savedTheme)
    const savedLang = localStorage.getItem('mis-libros-lang') as Language
    if (savedLang) setLanguage(savedLang)
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) localStorage.setItem('mis-libros-data', JSON.stringify(books))
  }, [books, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('mis-libros-theme', theme)
      if (theme === 'dark') document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    }
  }, [theme, isLoaded])

  useEffect(() => {
    if (isLoaded) localStorage.setItem('mis-libros-lang', language)
  }, [language, isLoaded])

  const addBook = (book: Book) => setBooks(prev => [...prev, book])
  const updateBook = (id: string, updatedBook: Partial<Book>) => setBooks(prev => prev.map(b => b.id === id ? { ...b, ...updatedBook } : b))
  const removeBook = (id: string) => setBooks(prev => prev.filter(b => b.id !== id))
  
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')
  const changeLanguage = (lang: Language) => setLanguage(lang)

  return (
    <BookContext.Provider value={{ books, addBook, updateBook, removeBook, theme, toggleTheme, language, changeLanguage }}>
      {children}
    </BookContext.Provider>
  )
}

export const useBooks = () => {
  const context = useContext(BookContext)
  if (!context) throw new Error('useBooks error')
  return context
}