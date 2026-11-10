'use client'

import { useState, useRef } from 'react'
import { Download, Upload, Moon, Globe, Heart, CheckCircle2, AlertCircle, HardDrive, ArrowLeft } from 'lucide-react'
import { useBooks, Language } from '../context/BookContext'
import Link from 'next/link'

export default function Ajustes() {
  const { books, theme, toggleTheme, language, changeLanguage, t } = useBooks()
  const [status, setStatus] = useState({ type: '', msg: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const dict = t.settings

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(books, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `mis-libros-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setStatus({ type: 'success', msg: dict.successExport })
      setTimeout(() => setStatus({ type: '', msg: '' }), 3000)
    } catch (error) {
      setStatus({ type: 'error', msg: dict.errorExport })
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string)
        if (Array.isArray(importedData)) {
          localStorage.setItem('mis-libros-data', JSON.stringify(importedData))
          setStatus({ type: 'success', msg: dict.successImport })
          setTimeout(() => window.location.reload(), 1500)
        } else throw new Error('Invalid format')
      } catch (error) {
        setStatus({ type: 'error', msg: dict.errorImport })
        setTimeout(() => setStatus({ type: '', msg: '' }), 3000)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12 dark:text-gray-100 transition-colors">
      
      <div className="flex items-center gap-4 mb-2">
        <Link href="/" className="p-2.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition shadow-sm flex items-center justify-center">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{dict.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{dict.subtitle}</p>
        </div>
      </div>

      {status.msg && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50' : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50'}`}>
          {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {status.msg}
        </div>
      )}

      <section className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden transition-colors">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800 flex items-center gap-2 bg-gray-50/50 dark:bg-neutral-900/50">
          <HardDrive size={18} className="text-amber-600 dark:text-amber-400" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">{dict.dataSync}</h3>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{dict.dataSyncDesc}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800/50 p-3 rounded-xl transition font-medium">
              <Download size={20} /> {dict.exportJson}
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 p-3 rounded-xl transition font-medium">
              <Upload size={20} /> {dict.importJson}
            </button>
            <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="hidden" />
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden transition-colors">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800 flex items-center gap-2 bg-gray-50/50 dark:bg-neutral-900/50">
          <Moon size={18} className="text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">{dict.personalization}</h3>
        </div>
        <div className="p-0">
          <div className="flex items-center justify-between p-5 border-b border-gray-50 dark:border-neutral-800">
            <div><p className="font-medium text-gray-800 dark:text-gray-200">{dict.darkMode}</p></div>
            <button onClick={toggleTheme} className={`w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-purple-600' : 'bg-gray-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`}></div>
            </button>
          </div>
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-gray-400 dark:text-neutral-500" />
              <div><p className="font-medium text-gray-800 dark:text-gray-200">{dict.language}</p></div>
            </div>
            <select 
              value={language}
              onChange={(e) => changeLanguage(e.target.value as Language)}
              className="border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-sm font-medium text-gray-600 dark:text-gray-200 py-2 px-3 rounded-lg outline-none cursor-pointer focus:ring-2 focus:ring-amber-500"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="pt">Português</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
            </select>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-amber-600 to-indigo-700 dark:from-amber-900 dark:to-indigo-950 rounded-2xl shadow-md overflow-hidden text-white p-6 text-center transition-colors">
        <Heart size={32} className="mx-auto mb-3 text-pink-300" />
        <h3 className="font-bold text-lg mb-2">{dict.supportTitle}</h3>
        <p className="text-sm text-amber-100 mb-5 max-w-md mx-auto">{dict.supportDesc}</p>
        <a href="https://ko-fi.com/imperioy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-white text-amber-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-50 transition shadow-sm w-full sm:w-auto">
          <Heart size={18} className="fill-amber-700" /> {dict.donateBtn}
        </a>
      </section>
      
      <div className="text-center text-xs text-gray-400 pt-4 pb-8">Mis Libros v1.0.0</div>
    </div>
  )
}