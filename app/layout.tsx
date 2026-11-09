'use client'

import './globals.css'
import { BookProvider, useBooks } from './context/BookContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookMarked, Clock, Settings, BookOpenText } from 'lucide-react'
import { useEffect } from 'react'

const dict = {
  es: { title: "Coda", lib: "Librería", pend: "Pendientes", set: "Ajustes" },
  en: { title: "Coda", lib: "Library", pend: "Pending", set: "Settings" },
  fr: { title: "Coda", lib: "Bibliothèque", pend: "À lire", set: "Paramètres" },
  pt: { title: "Coda", lib: "Biblioteca", pend: "Pendentes", set: "Configurações" },
  de: { title: "Coda", lib: "Bibliothek", pend: "Ausstehend", set: "Einstellungen" },
  it: { title: "Coda", lib: "Libreria", pend: "In Coda", set: "Impostazioni" }
}

function NavigationContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme, language } = useBooks()
  const t = dict[language] || dict.es

  // Registra el Service Worker para la PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.error(err))
    }
  }, [])

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${theme === 'dark' ? 'dark bg-neutral-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      <header className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 sticky top-0 z-30 px-4 py-3 shadow-sm transition-colors">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-600 dark:bg-amber-500 text-white p-1.5 rounded-lg shadow-sm">
              <BookOpenText size={22} />
            </div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t.title}</h1>
          </div>

          <Link href="/ajustes" className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition" title={t.set}>
            <Settings size={22} />
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-t border-gray-200 dark:border-neutral-800 py-2 px-6 flex justify-around items-center z-30 transition-colors">
        <Link href="/" className={`flex flex-col items-center gap-1 text-xs font-medium transition ${pathname === '/' ? 'text-amber-600 dark:text-amber-500' : 'text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          <BookMarked size={22} /><span>{t.lib}</span>
        </Link>
        <Link href="/pendientes" className={`flex flex-col items-center gap-1 text-xs font-medium transition ${pathname === '/pendientes' ? 'text-amber-600 dark:text-amber-500' : 'text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          <Clock size={22} /><span>{t.pend}</span>
        </Link>
      </nav>
      
    </div>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="antialiased font-sans bg-gray-50 dark:bg-neutral-950 transition-colors duration-200">
        <BookProvider>
          <NavigationContent>{children}</NavigationContent>
        </BookProvider>
      </body>
    </html>
  )
}