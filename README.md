<div align="center">
  <h1>📚 Coda</h1>
  <p><b>Your personal library, reading log, and dynamic statistics tracker.</b></p>
  
  <p>
    <a href="https://coda-ten-omega.vercel.app" target="_blank">🌐 Live Web Demo</a> •
    <a href="https://github.com/imperioy/CODA/releases">📦 Download App (Android / Windows)</a>
  </p>

  <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1000&auto=format&fit=crop" alt="Coda Banner" width="100%" style="border-radius: 12px;"/>
</div>

---

## ✨ Features

- 🔍 **Google Books Integration:** Instant title and author search with automatic book cover and details fetching.
- 🧱 **3D Customizable Shelves & Room Decor:** Decorate your reading room with customizable wall textures, bookcase styles, and shelf tints.
- 🎨 **Dynamic Book Spines:** Automatic extraction of dominant cover colors to render realistic, color-accurate book spines on digital shelves.
- 📊 **Advanced Analytics & Auto-Sorting:** Comprehensive reading stats, total pages read, and rating averages. Sort shelves by title, page count, or rating.
- ✏️ **Full Book & Cover Editing:** Edit titles, authors, and cover image URLs for books in both your read library and pending wishlist.
- ⭐ **Precision Rating System:** Flexible rating scale capped from 0 to 10 points with up to 2 decimal places (e.g., 8.75).
- 🔎 **Smart Instant Search:** Search bars across your main library, digital shelves, and pending reading list.
- 🌍 **Multi-language Support (i18n):** Full localization in 6 languages (**English, Spanish, French, Portuguese, German, and Italian**).
- 🌙 **Deep Dark Mode:** Sleek, modern aesthetic engineered with a custom palette and warm accents.
- 🔒 **Data Sovereignty:** 100% private data stored locally on your device (`localStorage`) with seamless JSON export and import options.
- 💻 **Cross-Platform Native Apps:** Available via web browser, installable PWA, standalone Windows installer (`.exe`), and Android app (`.apk`).

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Static Export)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Desktop Application:** [Electron](https://www.electronjs.org/) & [electron-builder](https://www.electron.build/) (Windows `.exe`)
- **Mobile Application:** [Capacitor](https://capacitorjs.com/) (Android `.apk`)
- **Deployment:** [Vercel](https://vercel.com/)

---

## 📲 Downloads

Download pre-compiled standalone releases directly from the **[Releases Section](https://github.com/imperioy/CODA/releases)**:
- **Android:** `app-debug.apk` (Native Android package)
- **Windows 10/11:** `Coda Setup 1.0.0.exe` (Standalone Windows Installer)

---

## 🚀 Local Development Setup

To run Coda locally on your machine, run the following commands in your terminal:

    # 1. Clone the repository
    git clone https://github.com/imperioy/CODA.git

    # 2. Navigate to project folder
    cd CODA

    # 3. Install dependencies
    npm install

Create a `.env.local` file in the root directory and add your Google Books API key:
    
    NEXT_PUBLIC_BOOKS_API_KEY=your_google_books_api_key_here

Start the local development server:

    npm run dev

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

## 🤝 Contributing & Support

Coda is open-source software. Contributions, bug reports, and feature requests are welcome!

If you find this project useful, please consider giving it a ⭐ on GitHub to support further development.