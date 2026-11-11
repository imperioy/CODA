'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit3, Settings2, X, Library, Paintbrush, Star, Calendar, RefreshCw, Search, ArrowDownUp, ChevronUp, ChevronDown } from 'lucide-react'
import { useBooks, Shelf, ShelfStyle, Book } from '../context/BookContext'
import { WALL_STYLES, BOOKCASE_STYLES, SHELF_STYLES } from './styles'

const FALLBACK_COLORS = ['#7f1d1d', '#1e3a8a', '#064e3b', '#78350f', '#4c1d95', '#831843', '#1e293b', '#451a03', '#3f6212', '#0f766e'];

const extractDominantColor = (bookId: string, imageUrl: string, callback: (color: string) => void) => {
  const getFallbackColor = () => {
    let hash = 0;
    for (let i = 0; i < bookId.length; i++) hash = bookId.charCodeAt(i) + ((hash << 5) - hash);
    return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
  };

  if (!imageUrl) return callback(getFallbackColor());

  const img = new Image();
  img.crossOrigin = "Anonymous";
  const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&w=50&h=50&output=jpg`;
  img.src = proxyUrl;
  
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return callback(getFallbackColor()); 
    
    canvas.width = img.width; 
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let r = 0, g = 0, b = 0, count = 0;
      
      for (let i = 0; i < imgData.length; i += 4) {
        const pr = imgData[i], pg = imgData[i+1], pb = imgData[i+2];
        if (pr > 220 && pg > 220 && pb > 220) continue;
        if (pr < 35 && pg < 35 && pb < 35) continue;
        r += pr; g += pg; b += pb; count++;
      }
      
      if (count === 0) return callback(getFallbackColor());
      
      r = Math.floor((r / count) * 0.9);
      g = Math.floor((g / count) * 0.9);
      b = Math.floor((b / count) * 0.9);
      
      callback(`rgb(${r}, ${g}, ${b})`);
    } catch (e) {
      callback(getFallbackColor());
    }
  };

  img.onerror = () => callback(getFallbackColor());
}

function SpineBook({ 
  book, 
  onClick, 
  onDragStart, 
  onDragOver, 
  onDragLeave, 
  onDrop, 
  isDragOver 
}: { 
  book: Book, 
  onClick: () => void,
  onDragStart: (e: React.DragEvent) => void,
  onDragOver: (e: React.DragEvent) => void,
  onDragLeave: (e: React.DragEvent) => void,
  onDrop: (e: React.DragEvent) => void,
  isDragOver: boolean
}) {
  const { updateBook } = useBooks();
  const [spineBg, setSpineBg] = useState<string>(book.spineColor || '');

  useEffect(() => {
    if (!book.spineColor) {
      extractDominantColor(book.id, book.thumbnail, (color) => {
        setSpineBg(color);
        updateBook(book.id, { spineColor: color });
      });
    } else {
      setSpineBg(book.spineColor);
    }
  }, [book.id, book.thumbnail, book.spineColor, updateBook]);

  const pages = book.pageCount || 200;
  const width = Math.min(50, Math.max(28, 22 + Math.floor(pages / 22)));
  const height = Math.min(160, Math.max(120, 120 + Math.floor(pages / 20)));
  
  const maxTextWidth = height - 16; 
  const finalFontSize = 10;

  return (
    <div 
      draggable
      onClick={onClick}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{ height: `${height}px`, width: `${width}px`, backgroundColor: spineBg || '#4a3b32' }}
      className={`flex-shrink-0 rounded-sm shadow-[2px_0_6px_rgba(0,0,0,0.7)] border-l border-white/20 border-r border-black/80 border-t border-white/10 flex items-center justify-center cursor-pointer transition-transform relative group ${isDragOver ? 'ring-2 ring-amber-400 brightness-125 -translate-y-3' : 'hover:-translate-y-3'}`}
      title={book.title}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/50 pointer-events-none rounded-sm"></div>
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors rounded-sm pointer-events-none"></div>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          style={{
            width: `${maxTextWidth}px`,
            height: `${width}px`,
            transform: 'rotate(-90deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingLeft: '4px'
          }}
        >
          <span 
            className="font-bold text-gray-100 uppercase tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]"
            style={{ 
              fontSize: `${finalFontSize}px`,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: '100%',
              textAlign: 'left',
              lineHeight: 1
            }}
          >
            {book.title}
          </span>
        </div>
      </div>
    </div>
  )
}

function renderStars(rating?: number) {
  if (rating === undefined || rating === null) return null
  const formattedRating = Math.round(Number(rating) * 100) / 100
  return (
    <div className="flex justify-center items-center gap-1.5 mt-2">
      <Star size={16} className="fill-amber-500 text-amber-500" />
      <span className="font-bold text-gray-800 dark:text-white text-sm">{formattedRating}</span>
    </div>
  )
}

export default function Estanterias() {
  const { books, shelves, setShelves, addShelf, removeShelf, updateShelf, updateBook, wallStyle, setWallStyle, bookcaseStyle, setBookcaseStyle, t } = useBooks()
  
  const moveShelf = (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= shelves.length) return
    const newShelves = [...shelves]
    const temp = newShelves[currentIndex]
    newShelves[currentIndex] = newShelves[targetIndex]
    newShelves[targetIndex] = temp
    setShelves(newShelves)
    localStorage.setItem('mis-libros-shelves', JSON.stringify(newShelves))
  }
  
  const [showRoomSettings, setShowRoomSettings] = useState(false)
  const [showNewShelf, setShowNewShelf] = useState(false)
  const [newShelfName, setNewShelfName] = useState('')
  const [newShelfStyle, setNewShelfStyle] = useState<ShelfStyle>('normal')
  
  const [editingShelf, setEditingShelf] = useState<Shelf | null>(null)
  const [editName, setEditName] = useState('')
  const [editStyle, setEditStyle] = useState<ShelfStyle>('normal')
  
  const [activeShelfForBooks, setActiveShelfForBooks] = useState<Shelf | null>(null)
  const [selectedBookDetail, setSelectedBookDetail] = useState<Book | null>(null)
  const [isRecalculating, setIsRecalculating] = useState(false)

  const [shelfSearchQuery, setShelfSearchQuery] = useState('')
  const [bookSearchQuery, setBookSearchQuery] = useState('')
  const [dragOverBookId, setDragOverBookId] = useState<string | null>(null)

  const [sortingShelf, setSortingShelf] = useState<Shelf | null>(null)

  const myReadBooks = books.filter(b => b.status === 'libreria')
  
  const filteredShelves = shelves.filter(s => s.name.toLowerCase().includes(shelfSearchQuery.toLowerCase()))
  const filteredModalBooks = myReadBooks.filter(b => b.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) || (b.authors && b.authors.join(', ').toLowerCase().includes(bookSearchQuery.toLowerCase())))

  const currentWall = WALL_STYLES[wallStyle as keyof typeof WALL_STYLES] || WALL_STYLES.ladrillo_clasico
  const currentBookcase = BOOKCASE_STYLES[bookcaseStyle as keyof typeof BOOKCASE_STYLES] || BOOKCASE_STYLES.oscura

  const handleCreateShelf = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newShelfName.trim()) return
    addShelf(newShelfName, newShelfStyle)
    setNewShelfName(''); setNewShelfStyle('normal'); setShowNewShelf(false)
  }

  const handleEditShelf = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim() || !editingShelf) return
    updateShelf(editingShelf.id, { name: editName, style: editStyle })
    setEditingShelf(null)
  }

  const toggleBookInShelf = (bookId: string, shelfId: string) => {
    const book = books.find(b => b.id === bookId)
    if (!book) return
    updateBook(bookId, { shelfId: book.shelfId === shelfId ? undefined : shelfId })
  }

  const handleRecalculateColors = () => {
    setIsRecalculating(true)
    myReadBooks.forEach(book => {
      updateBook(book.id, { spineColor: undefined })
    })
    setTimeout(() => setIsRecalculating(false), 1500)
  }

  const handleAutoSort = (sortType: 'title' | 'pages-asc' | 'pages-desc' | 'rating') => {
    if (!sortingShelf) return;
    
    const shelfBooks = myReadBooks.filter(b => b.shelfId === sortingShelf.id);
    
    const sorted = [...shelfBooks].sort((a, b) => {
      if (sortType === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortType === 'pages-asc') {
        return (a.pageCount || 0) - (b.pageCount || 0);
      } else if (sortType === 'pages-desc') {
        return (b.pageCount || 0) - (a.pageCount || 0);
      } else if (sortType === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return 0;
    });

    sorted.forEach((book, index) => {
      updateBook(book.id, { shelfOrder: index } as Partial<Book>);
    });

    setSortingShelf(null);
  }

  const handleDragStart = (e: React.DragEvent, bookId: string) => {
    e.dataTransfer.setData('text/plain', bookId);
    e.dataTransfer.effectAllowed = 'move';
  }

  const handleDragOverBook = (e: React.DragEvent, bookId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverBookId !== bookId) setDragOverBookId(bookId);
  }

  const handleDragLeaveBook = (e: React.DragEvent, bookId: string) => {
    e.preventDefault();
    if (dragOverBookId === bookId) setDragOverBookId(null);
  }

  const handleDropOnBook = (e: React.DragEvent, targetBook: Book, shelfId: string) => {
    e.preventDefault();
    e.stopPropagation(); 
    setDragOverBookId(null);

    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId === targetBook.id) return;

    const sourceBook = books.find(b => b.id === sourceId);
    if (!sourceBook || sourceBook.shelfId !== shelfId) return;

    const shelfBooks = myReadBooks
      .filter(b => b.shelfId === shelfId)
      .sort((a, b) => ((a as any).shelfOrder ?? 9999) - ((b as any).shelfOrder ?? 9999));

    const sourceIndex = shelfBooks.findIndex(b => b.id === sourceId);
    const targetIndex = shelfBooks.findIndex(b => b.id === targetBook.id);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const newShelfBooks = [...shelfBooks];
    const [movedBook] = newShelfBooks.splice(sourceIndex, 1);
    newShelfBooks.splice(targetIndex, 0, movedBook);

    newShelfBooks.forEach((book, index) => {
      updateBook(book.id, { shelfOrder: index } as Partial<Book>);
    });
  }

  const handleDropOnShelf = (e: React.DragEvent, shelfId: string) => {
    e.preventDefault();
    setDragOverBookId(null);
    const sourceId = e.dataTransfer.getData('text/plain');
    const sourceBook = books.find(b => b.id === sourceId);
    
    if (!sourceBook || sourceBook.shelfId !== shelfId) return;

    const shelfBooks = myReadBooks
      .filter(b => b.shelfId === shelfId)
      .sort((a, b) => ((a as any).shelfOrder ?? 9999) - ((b as any).shelfOrder ?? 9999));

    const sourceIndex = shelfBooks.findIndex(b => b.id === sourceId);
    
    if (sourceIndex === -1 || sourceIndex === shelfBooks.length - 1) return;

    const newShelfBooks = [...shelfBooks];
    const [movedBook] = newShelfBooks.splice(sourceIndex, 1);
    newShelfBooks.push(movedBook);

    newShelfBooks.forEach((book, index) => {
      updateBook(book.id, { shelfOrder: index } as Partial<Book>);
    });
  }

  return (
    <div 
      className="-mx-4 sm:-mx-6 -mt-4 sm:-mt-6 p-4 sm:p-8 min-h-[90vh] transition-colors duration-500"
      style={{ backgroundColor: currentWall.bg, backgroundImage: currentWall.texture, backgroundRepeat: 'repeat' }}
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white/90 dark:bg-black/70 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-black/10">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2 bg-amber-800 text-white rounded-lg"><Library size={24}/></div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white whitespace-nowrap">{t.shelves.pageTitle}</h2>
        </div>

        <div className="relative w-full md:max-w-xs flex-1">
          <input 
            type="text" 
            placeholder={t.shelves.searchShelfPlaceholder} 
            value={shelfSearchQuery}
            onChange={(e) => setShelfSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 text-sm focus:ring-2 focus:ring-amber-800 outline-none dark:text-white transition"
          />
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => setShowRoomSettings(true)} className="flex-1 md:flex-none p-2.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl hover:bg-gray-50 transition shadow-sm text-gray-700 dark:text-gray-200 flex justify-center">
            <Paintbrush size={18} />
          </button>
          <button onClick={() => setShowNewShelf(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amber-800 hover:bg-amber-900 text-white font-medium px-4 py-2.5 rounded-xl shadow-md transition">
            <Plus size={18} /> {t.shelves.addShelf}
          </button>
        </div>
      </div>

      <div 
        className="max-w-5xl mx-auto flex flex-col min-h-[60vh] rounded-t-sm shadow-[0_25px_50px_rgba(0,0,0,0.7)] transition-colors duration-300 pt-[20px] px-[20px]"
        style={{
          backgroundColor: currentBookcase.bg, 
          backgroundImage: currentBookcase.texture, 
          backgroundRepeat: 'repeat'
        }}
      >
        {filteredShelves.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-black/20 text-center">
            <p className={`font-medium ${currentBookcase.text}`}>
              {shelves.length === 0 ? t.shelves.emptyBookcase : t.shelves.noShelfFound}
            </p>
          </div>
        ) : (
          filteredShelves.map((shelf) => {
            const currentIndex = shelves.findIndex(s => s.id === shelf.id);
            const isFirst = currentIndex === 0;
            const isLast = currentIndex === shelves.length - 1;

            const shelfBooks = myReadBooks
              .filter(b => b.shelfId === shelf.id)
              .sort((a, b) => ((a as any).shelfOrder ?? 9999) - ((b as any).shelfOrder ?? 9999));
              
            const sStyle = SHELF_STYLES[shelf.style as keyof typeof SHELF_STYLES] || SHELF_STYLES.normal || Object.values(SHELF_STYLES)[0] || { bg: '#3b2313', texture: '', text: 'text-amber-100' }
            
            return (
              <div key={shelf.id} className="relative flex flex-col border-b-[14px] border-black/40">
                <div className="absolute inset-0 z-0 transition-colors duration-300" style={{ backgroundColor: sStyle.bg, backgroundImage: sStyle.texture, backgroundRepeat: 'repeat' }}>
                  <div className="absolute inset-0 shadow-[inset_0_20px_20px_-15px_rgba(0,0,0,0.6)] pointer-events-none"></div>
                </div>

                <div className="relative z-20 flex justify-between items-center px-5 pt-3 pb-1">
                  <div className="bg-[#fefae0]/95 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-md border border-[#bc6c25]/30">
                    <h3 className="font-bold tracking-wide text-sm text-[#3a2518]">
                      {shelf.name} <span className="opacity-80 text-xs font-medium">({shelfBooks.length})</span>
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm p-1 rounded-lg border border-white/10 shadow-sm">
                    <button 
                      onClick={() => moveShelf(currentIndex, 'up')} 
                      disabled={isFirst}
                      className={`p-1.5 rounded transition text-white ${isFirst ? 'opacity-30 pointer-events-none cursor-not-allowed bg-white/5' : 'bg-white/10 hover:bg-white/20'}`} 
                      title={t.shelves.moveUpShelfTooltip}
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button 
                      onClick={() => moveShelf(currentIndex, 'down')} 
                      disabled={isLast}
                      className={`p-1.5 rounded transition text-white ${isLast ? 'opacity-30 pointer-events-none cursor-not-allowed bg-white/5' : 'bg-white/10 hover:bg-white/20'}`} 
                      title={t.shelves.moveDownShelfTooltip}
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button onClick={() => setSortingShelf(shelf)} className="p-1.5 rounded transition bg-white/10 hover:bg-white/20 text-white" title={t.shelves.sortBooksTooltip}>
                      <ArrowDownUp size={14} />
                    </button>
                    <button onClick={() => {setActiveShelfForBooks(shelf); setBookSearchQuery('');}} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition font-medium bg-white/10 hover:bg-white/20 text-white">
                      <Settings2 size={14} /> {t.shelves.manageBooksBtn}
                    </button>
                    <button onClick={() => { setEditingShelf(shelf); setEditName(shelf.name); setEditStyle(shelf.style); }} className="p-1.5 rounded transition bg-white/10 hover:bg-white/20 text-white" title={t.shelves.editShelfTooltip}>
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => { if(confirm(t.shelves.deleteShelfConfirm.replace('{name}', shelf.name))) removeShelf(shelf.id) }} className="p-1.5 rounded transition hover:bg-red-500/80 text-white" title={t.shelves.deleteShelfTooltip}>
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>

                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnShelf(e, shelf.id)}
                  className="pt-4 pb-2 px-6 min-h-[170px] flex items-end gap-[3px] overflow-x-auto scrollbar-thin relative z-10"
                >
                  {shelfBooks.map((book) => (
                    <SpineBook 
                      key={book.id} 
                      book={book} 
                      onClick={() => setSelectedBookDetail(book)}
                      onDragStart={(e) => handleDragStart(e, book.id)}
                      onDragOver={(e) => handleDragOverBook(e, book.id)}
                      onDragLeave={(e) => handleDragLeaveBook(e, book.id)}
                      onDrop={(e) => handleDropOnBook(e, book, shelf.id)}
                      isDragOver={dragOverBookId === book.id}
                    />
                  ))}
                </div>

                <div 
                  className="h-5 w-full relative z-20 shadow-[inset_0_-3px_5px_rgba(0,0,0,0.3),_0_5px_8px_rgba(0,0,0,0.6)] border-t border-white/10"
                  style={{ backgroundColor: currentBookcase.board, backgroundImage: currentBookcase.texture, backgroundRepeat: 'repeat' }}
                ></div>
              </div>
            )
          })
        )}
      </div>

      {sortingShelf && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-xs p-6 shadow-2xl border dark:border-neutral-800">
            <div className="flex justify-between items-start mb-4 border-b dark:border-neutral-800 pb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white leading-tight">{t.shelves.sortModalTitle}</h3>
                <p className="text-sm text-gray-500 dark:text-neutral-400">"{sortingShelf.name}"</p>
              </div>
              <button onClick={() => setSortingShelf(null)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            
            <div className="space-y-2">
              <button onClick={() => handleAutoSort('title')} className="w-full text-left p-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 hover:bg-amber-50 hover:border-amber-200 dark:hover:border-amber-900/50 transition flex items-center gap-3">
                <span className="text-xl">🔤</span>
                <div>
                  <p className="font-semibold text-sm text-gray-800 dark:text-white">{t.shelves.sortAlphabetical}</p>
                  <p className="text-xs text-gray-500">{t.shelves.sortAlphabeticalSub}</p>
                </div>
              </button>
              
              <button onClick={() => handleAutoSort('pages-asc')} className="w-full text-left p-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 hover:bg-amber-50 hover:border-amber-200 dark:hover:border-amber-900/50 transition flex items-center gap-3">
                <span className="text-xl">📏</span>
                <div>
                  <p className="font-semibold text-sm text-gray-800 dark:text-white">{t.shelves.sortPagesAsc}</p>
                  <p className="text-xs text-gray-500">{t.shelves.sortPagesAscSub}</p>
                </div>
              </button>

              <button onClick={() => handleAutoSort('pages-desc')} className="w-full text-left p-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 hover:bg-amber-50 hover:border-amber-200 dark:hover:border-amber-900/50 transition flex items-center gap-3">
                <span className="text-xl">📚</span>
                <div>
                  <p className="font-semibold text-sm text-gray-800 dark:text-white">{t.shelves.sortPagesDesc}</p>
                  <p className="text-xs text-gray-500">{t.shelves.sortPagesDescSub}</p>
                </div>
              </button>

              <button onClick={() => handleAutoSort('rating')} className="w-full text-left p-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 hover:bg-amber-50 hover:border-amber-200 dark:hover:border-amber-900/50 transition flex items-center gap-3">
                <span className="text-xl">⭐</span>
                <div>
                  <p className="font-semibold text-sm text-gray-800 dark:text-white">{t.shelves.sortRating}</p>
                  <p className="text-xs text-gray-500">{t.shelves.sortRatingSub}</p>
                </div>
              </button>
            </div>
            
            <button onClick={() => setSortingShelf(null)} className="w-full mt-4 py-2.5 bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 text-gray-800 dark:text-white rounded-xl font-medium">{t.shelves.cancelBtn}</button>
          </div>
        </div>
      )}

      {selectedBookDetail && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl border dark:border-neutral-800 text-center relative my-8">
            <button onClick={() => setSelectedBookDetail(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition">
              <X size={20} />
            </button>

            <div className="space-y-4">
              <img src={selectedBookDetail.thumbnail} alt="" className="w-32 h-48 object-cover rounded-xl shadow-lg mx-auto" />
              <div>
                <h3 className="font-bold text-2xl dark:text-white leading-tight">{selectedBookDetail.title}</h3>
                <p className="text-md text-gray-500 dark:text-neutral-400 mt-1">{selectedBookDetail.authors?.join(', ')}</p>
                <p className="text-sm text-amber-700 dark:text-amber-500 font-bold mt-1">{t.shelves.pagesCount.replace('{count}', String(selectedBookDetail.pageCount || 0))}</p>
              </div>
              
              {renderStars(selectedBookDetail.rating)}

              {(selectedBookDetail.startDate || selectedBookDetail.endDate) && (
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-800 py-2 px-4 rounded-full mx-auto w-fit">
                  <Calendar size={14} />
                  {selectedBookDetail.startDate && selectedBookDetail.endDate ? (
                    <span>{selectedBookDetail.startDate} &rarr; {selectedBookDetail.endDate}</span>
                  ) : selectedBookDetail.endDate ? (
                    <span>{t.shelves.finishedOn.replace('{date}', selectedBookDetail.endDate)}</span>
                  ) : (
                    <span>{t.shelves.startedOn.replace('{date}', selectedBookDetail.startDate || '')}</span>
                  )}
                </div>
              )}
              {selectedBookDetail.comment && (
                <p className="text-sm bg-gray-50 dark:bg-neutral-800 p-4 rounded-xl text-gray-700 dark:text-neutral-300 italic max-h-36 overflow-y-auto text-left shadow-inner">
                  "{selectedBookDetail.comment}"
                </p>
              )}
              <button onClick={() => setSelectedBookDetail(null)} className="w-full mt-4 py-3 bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-800 dark:text-white rounded-xl font-medium transition">
                {t.shelves.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRoomSettings && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl border dark:border-neutral-800">
            <div className="flex justify-between items-center mb-5 border-b dark:border-neutral-800 pb-3">
              <h3 className="font-bold text-lg dark:text-white">{t.shelves.decorateRoom}</h3>
              <button onClick={() => setShowRoomSettings(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.shelves.wallColorLabel}</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(WALL_STYLES).map(([key, style]) => (
                    <button key={key} onClick={() => setWallStyle(key as any)} className={`p-2.5 text-xs border rounded-xl transition ${wallStyle === key ? 'border-amber-700 bg-amber-50 text-amber-800 font-bold' : 'border-gray-200 dark:border-neutral-700 dark:text-gray-300 hover:bg-gray-50'}`}>
                      {t.styles.walls[key as keyof typeof t.styles.walls] || style.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.shelves.bookcaseColorLabel}</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(BOOKCASE_STYLES).map(([key, style]) => (
                    <button key={key} onClick={() => setBookcaseStyle(key as any)} className={`p-2.5 text-xs border rounded-xl transition ${bookcaseStyle === key ? 'border-amber-700 bg-amber-50 text-amber-800 font-bold' : 'border-gray-200 dark:border-neutral-700 dark:text-gray-300 hover:bg-gray-50'}`}>
                      {t.styles.bookcases[key as keyof typeof t.styles.bookcases] || style.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t dark:border-neutral-800 mt-2">
                <button 
                  onClick={handleRecalculateColors} 
                  disabled={isRecalculating}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-amber-600 text-amber-700 dark:text-amber-500 rounded-xl text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition disabled:opacity-50"
                >
                  <RefreshCw size={16} className={isRecalculating ? "animate-spin" : ""} />
                  {isRecalculating ? t.shelves.recalculatingBtn : t.shelves.recalculateSpinesBtn}
                </button>
              </div>
            </div>
            <button onClick={() => setShowRoomSettings(false)} className="w-full mt-6 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-medium">{t.shelves.closeBtn}</button>
          </div>
        </div>
      )}

      {showNewShelf && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl border dark:border-neutral-800">
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">{t.shelves.newShelfTitle}</h3>
            <form onSubmit={handleCreateShelf}>
              <div className="space-y-3 mb-5">
                <input type="text" required placeholder={t.shelves.shelfNamePlaceholder} className="w-full p-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-amber-800 outline-none text-gray-800 dark:text-white" value={newShelfName} onChange={e => setNewShelfName(e.target.value)} />
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">{t.shelves.shelfTintLabel}</label>
                <select className="w-full p-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-amber-800 outline-none text-gray-800 dark:text-white" value={newShelfStyle} onChange={e => setNewShelfStyle(e.target.value as ShelfStyle)}>
                  {Object.entries(SHELF_STYLES).map(([key, style]) => (
                    <option key={key} value={key}>{t.styles.shelves[key as keyof typeof t.styles.shelves] || style.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowNewShelf(false)} className="flex-1 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium">{t.shelves.cancelBtn}</button>
                <button type="submit" className="flex-1 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-medium">{t.shelves.createBtn}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingShelf && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl border dark:border-neutral-800">
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">{t.shelves.editShelfTitle}</h3>
            <form onSubmit={handleEditShelf}>
              <div className="space-y-3 mb-5">
                <input type="text" required className="w-full p-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-amber-800 outline-none text-gray-800 dark:text-white" value={editName} onChange={e => setEditName(e.target.value)} />
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">{t.shelves.shelfTintLabel}</label>
                <select className="w-full p-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-amber-800 outline-none text-gray-800 dark:text-white" value={editStyle} onChange={e => setEditStyle(e.target.value as ShelfStyle)}>
                  {Object.entries(SHELF_STYLES).map(([key, style]) => (
                    <option key={key} value={key}>{t.styles.shelves[key as keyof typeof t.styles.shelves] || style.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditingShelf(null)} className="flex-1 py-2.5 border border-gray-300 dark:border-neutral-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium">{t.shelves.cancelBtn}</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium">{t.shelves.saveBtn}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeShelfForBooks && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl border dark:border-neutral-800">
            <div className="p-4 border-b border-gray-200 dark:border-neutral-800">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">{t.shelves.shelfModalTitle.replace('{name}', activeShelfForBooks.name)}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t.shelves.shelfModalSub}</p>
                </div>
                <button onClick={() => setActiveShelfForBooks(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder={t.shelves.searchBooksToAdd} 
                  value={bookSearchQuery}
                  onChange={(e) => setBookSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-amber-800 outline-none dark:text-white"
                />
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {filteredModalBooks.length === 0 ? <p className="text-center text-sm text-gray-500 py-4">{t.shelves.noBooksFound}</p> : 
                filteredModalBooks.map((book) => {
                  const isInThisShelf = book.shelfId === activeShelfForBooks.id
                  return (
                    <label key={book.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${isInThisShelf ? 'bg-amber-50 border-amber-600' : 'hover:bg-gray-50 border-gray-200 dark:border-neutral-800'}`}>
                      <input type="checkbox" className="w-5 h-5 rounded text-amber-600 accent-amber-600" checked={isInThisShelf} onChange={() => toggleBookInShelf(book.id, activeShelfForBooks.id)} />
                      <img src={book.thumbnail} alt="" className="w-8 h-12 object-cover rounded shadow-sm" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold line-clamp-1 text-gray-800 dark:text-white">{book.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{book.authors?.join(', ')}</p>
                      </div>
                    </label>
                  )
                })
              }
            </div>
            <div className="p-4 bg-gray-50 dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 rounded-b-2xl flex justify-end">
              <button onClick={() => setActiveShelfForBooks(null)} className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-sm font-medium">{t.shelves.doneBtn}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}