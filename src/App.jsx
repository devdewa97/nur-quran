import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Moon, Sun, Bookmark, Settings, Play, Pause, 
  ChevronLeft, X, BookOpen, Quote, Heart, ChevronRight,
  ArrowRight, Music, Clock, Sparkles, LayoutGrid
} from 'lucide-react';

// Konfigurasi API dan Branding
const API_BASE_URL = 'https://equran.id/api/v2';
const APP_NAME = "Nur Qur'an";
const BYLINE = "by Mas Dewa";
const TAGLINE = "Cahaya untuk Hati, Petunjuk Sepanjang Hidup";

// Qari ID 05 adalah Misyari Rasyid Al-Afasi (Nahawand Style)
const PREFERRED_QARI = '05'; 

// --- UTILS ---
const saveToLocal = (key, val) => localStorage.setItem(`nurquran_${key}`, JSON.stringify(val));
const getFromLocal = (key) => {
  const data = localStorage.getItem(`nurquran_${key}`);
  return data ? JSON.parse(data) : null;
};

const MOTIVATIONS = [
  {
    title: "Perniagaan yang Tiada Rugi",
    text: "Sesungguhnya orang-orang yang selalu membaca Kitab Allah dan mendirikan shalat... mereka mengharapkan perniagaan yang tidak akan merugi. (QS. Fatir: 29)"
  },
  {
    title: "Syafaat di Hari Kiamat",
    text: "Bacalah Al-Qur'an, karena ia akan datang pada hari kiamat memberikan syafaat bagi pembacanya. (HR. Muslim)"
  },
  {
    title: "Pahala Berlipat Ganda",
    text: "Siapa yang membaca satu huruf dari Al-Qur'an maka baginya satu kebaikan, dan satu kebaikan dilipatgandakan menjadi sepuluh. (HR. Tirmidzi)"
  }
];

const QUICK_SURAHS = [
  { id: 18, name: 'Al-Kahfi' },
  { id: 36, name: 'Yasin' },
  { id: 67, name: 'Al-Mulk' },
  { id: 56, name: 'Al-Waqi\'ah' }
];

const App = () => {
  const [view, setView] = useState('landing'); 
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [activeVerse, setActiveVerse] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [darkMode, setDarkMode] = useState(getFromLocal('darkMode') ?? false);
  const [fontSize, setFontSize] = useState(getFromLocal('fontSize') ?? 32);
  const [showTranslation, setShowTranslation] = useState(getFromLocal('showTrans') ?? true);
  const [bookmarks, setBookmarks] = useState(getFromLocal('bookmarks') || []);
  
  const audioRef = useRef(null);

  useEffect(() => {
    fetchSurahs();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveToLocal('darkMode', darkMode);
  }, [darkMode]);

  const fetchSurahs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/surat`);
      const json = await res.json();
      setSurahs(json.data);
      setLoading(false);
    } catch (err) {
      console.error("Gagal mengambil data surah", err);
      setLoading(false);
    }
  };

  const openSurah = async (number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/surat/${number}`);
      const json = await res.json();
      setSelectedSurah(json.data);
      setView('reader');
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Gagal mengambil detail surah", err);
      setLoading(false);
    }
  };

  const toggleBookmark = (verse) => {
    const isBookmarked = bookmarks.some(b => b.nomorAyat === verse.nomorAyat && b.surahNumber === selectedSurah.nomor);
    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = bookmarks.filter(b => !(b.nomorAyat === verse.nomorAyat && b.surahNumber === selectedSurah.nomor));
    } else {
      newBookmarks = [...bookmarks, { ...verse, surahNumber: selectedSurah.nomor, surahName: selectedSurah.namaLatin }];
    }
    setBookmarks(newBookmarks);
    saveToLocal('bookmarks', newBookmarks);
  };

  const playAudio = (verse) => {
    if (activeVerse === verse.nomorAyat && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setActiveVerse(verse.nomorAyat);
      const url = verse.audio[PREFERRED_QARI]; 
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    }
  };

  const filteredSurahs = surahs.filter(s => 
    s.namaLatin.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.nomor.toString().includes(searchTerm)
  );

  // --- UI COMPONENTS ---

  const IslamicPattern = ({ className }) => (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <pattern id="islamic-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
          <circle cx="40" cy="40" r="12" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#islamic-grid)" />
      </svg>
    </div>
  );

  const Logo = () => (
    <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0" onClick={() => setView('home')}>
      <div className="relative">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-700 rounded-lg flex items-center justify-center text-white shadow-lg rotate-2 group-hover:rotate-0 transition-transform duration-300">
          <BookOpen size={18} className="sm:size-20" />
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white dark:border-slate-900"></div>
      </div>
      <div className="flex flex-col">
        <h1 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white leading-none tracking-tight">
          {APP_NAME}
        </h1>
        <p className="text-[8px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-0.5 sm:mt-1">
          {BYLINE}
        </p>
      </div>
    </div>
  );

  const Header = () => (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-900 px-4 sm:px-8 py-2 sm:py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 transition-colors">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setView('bookmarks')} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 transition-colors">
            <Bookmark size={18} />
          </button>
          <button onClick={() => setView('settings')} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </nav>
  );

  const Footer = () => (
    <footer className="mt-8 sm:mt-16 pb-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto relative rounded-[2rem] sm:rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 p-8 sm:p-16 text-center shadow-2xl">
        <IslamicPattern className="text-emerald-500 opacity-20" />
        
        <div className="relative z-10 flex flex-col items-center">
           <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6 border border-white/10">
              <BookOpen size={20} className="sm:size-24" />
           </div>
           
           <h3 className="text-lg sm:text-2xl font-black text-white mb-2 tracking-tight">
             {APP_NAME} <span className="text-emerald-400">Digital</span>
           </h3>
           
           <p className="text-[10px] sm:text-sm text-emerald-100/60 max-w-xs mb-8 font-medium italic">
             "{TAGLINE}"
           </p>

           <div className="w-full max-w-sm h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent mb-8"></div>

           <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-8 text-[9px] sm:text-xs font-bold text-emerald-400 uppercase tracking-widest">
              <span>{BYLINE}</span>
              <span className="hidden sm:block opacity-30">•</span>
              <span>© 2026 — Khidmat Digital Al-Qur'an</span>
           </div>
        </div>
      </div>
    </footer>
  );

  // --- TAMPILAN: LANDING ---
  if (view === 'landing') {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center px-6 overflow-hidden relative ${darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
        <IslamicPattern className="text-emerald-600 opacity-5 dark:opacity-10" />
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-72 sm:h-72 bg-emerald-600/10 rounded-full blur-[80px] sm:blur-[100px] -mr-32 -mt-32"></div>
        <div className="max-w-3xl w-full text-center relative z-10 animate-in fade-in duration-1000 px-4">
           <div className="w-14 h-14 sm:w-20 sm:h-20 bg-emerald-700 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl rotate-3">
              <BookOpen size={28} className="sm:size-32" />
           </div>
           <h1 className="text-3xl sm:text-6xl font-black mb-6 tracking-tight leading-[1.2] sm:leading-[1.1]">
             Dekatkan Diri dengan <span className="text-emerald-600">Kalamullah.</span>
           </h1>
           <p className="text-sm sm:text-xl text-slate-500 mb-10 max-w-lg mx-auto leading-relaxed">
             Al-Qur'an Digital dengan irama Nahawand yang menenangkan jiwa.
           </p>
           <button 
             onClick={() => setView('home')}
             className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg font-bold shadow-xl flex items-center gap-3 mx-auto transition-all active:scale-95"
           >
             Yuk Baca Al Qur'an <ArrowRight size={18} className="sm:size-20" />
           </button>
        </div>
      </div>
    );
  }

  // --- TAMPILAN: READER ---
  if (view === 'reader' && selectedSurah) {
    const motivation = MOTIVATIONS[selectedSurah.nomor % MOTIVATIONS.length];
    return (
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10 relative">
          <button onClick={() => setView('home')} className="flex items-center gap-2 text-emerald-700 font-bold text-xs sm:text-sm mb-6 hover:text-emerald-800 transition-colors relative z-10">
            <ChevronLeft size={16} className="sm:size-18" /> Daftar Surah
          </button>

          <div className="text-center mb-10 sm:mb-16 relative z-10 px-2">
            <h2 className="text-xl sm:text-4xl font-black mb-1 tracking-tight">{selectedSurah.namaLatin}</h2>
            <p className="text-[10px] sm:text-base text-slate-500 mb-6 font-medium">{selectedSurah.arti} • {selectedSurah.jumlahAyat} Ayat</p>
            <div className="text-4xl sm:text-7xl font-serif text-emerald-700 mb-8">{selectedSurah.nama}</div>
            
            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute inset-0 bg-emerald-600/5 rounded-3xl blur-xl"></div>
              <div className="relative bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Heart size={14} className="text-emerald-600" fill="currentColor" />
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-emerald-800 tracking-tighter">{motivation.title}</span>
                </div>
                <p className="text-sm sm:text-lg italic font-medium text-slate-700 dark:text-slate-300 leading-relaxed">"{motivation.text}"</p>
              </div>
            </div>
          </div>

          <div className="space-y-12 sm:space-y-20 pb-40 relative z-10">
            {selectedSurah.nomor !== 9 && selectedSurah.nomor !== 1 && (
              <div className="text-center text-3xl sm:text-5xl font-serif py-10 opacity-90 leading-relaxed">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
            )}
            {selectedSurah.ayat.map((ayat) => (
              <div key={ayat.nomorAyat} className="group border-b border-slate-100 dark:border-slate-900 pb-10 sm:pb-16 last:border-0">
                <div className="flex flex-col gap-6 sm:gap-10">
                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black">
                      {selectedSurah.nomor}:{ayat.nomorAyat}
                    </span>
                    <button onClick={() => playAudio(ayat)} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${activeVerse === ayat.nomorAyat && isPlaying ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                      {activeVerse === ayat.nomorAyat && isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} />}
                    </button>
                    <button onClick={() => toggleBookmark(ayat)} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${bookmarks.some(b => b.nomorAyat === ayat.nomorAyat && b.surahNumber === selectedSurah.nomor) ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'}`}>
                      <Bookmark size={16} fill={bookmarks.some(b => b.nomorAyat === ayat.nomorAyat && b.surahNumber === selectedSurah.nomor) ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <div 
                    className={`text-right font-serif leading-[2.5] sm:leading-[3] ${activeVerse === ayat.nomorAyat && isPlaying ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-100'}`} 
                    style={{ fontSize: window.innerWidth < 640 ? `${fontSize * 0.7}px` : `${fontSize}px` }} 
                    dir="rtl"
                  >
                    {ayat.teksArab}
                  </div>
                  {showTranslation && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-lg font-light leading-relaxed max-w-2xl px-1">{ayat.teksIndonesia}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Player Bar */}
        {activeVerse && (
          <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl z-50 flex items-center justify-between ring-4 ring-emerald-500/5">
             <div className="flex flex-col ml-1 sm:ml-2 overflow-hidden">
                <span className="text-[8px] sm:text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1"><Music size={10} /> Nahawand</span>
                <span className="text-xs font-bold truncate max-w-[140px]">{selectedSurah.namaLatin} : {activeVerse}</span>
             </div>
             <div className="flex items-center gap-2">
               <button onClick={() => setIsPlaying(!isPlaying)} className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                  {isPlaying ? <Pause size={18} fill="white"/> : <Play size={18} fill="white"/>}
               </button>
               <button onClick={() => {setActiveVerse(null); setIsPlaying(false)}} className="text-slate-300 p-1.5 sm:p-2"><X size={16} sm:size={18}/></button>
             </div>
             <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
          </div>
        )}
      </div>
    );
  }

  // --- TAMPILAN: HOME ---
  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 sm:pt-6">
        
        {/* --- ELEGANT HERO SECTION --- */}
        <section className="relative w-full mb-8 sm:mb-20 rounded-[2rem] sm:rounded-[4rem] overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950"></div>
          <IslamicPattern className="text-emerald-500 opacity-20" />

          <div className="relative z-10 p-6 sm:p-20 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[9px] sm:text-xs font-black uppercase text-emerald-300 tracking-[0.2em] mb-6 border border-white/5">
              <Sparkles size={10} className="sm:size-12" /> Digital Experience
            </div>
            
            <h2 className="text-2xl sm:text-6xl font-black text-white leading-[1.2] sm:leading-[1.1] mb-6 max-w-3xl tracking-tight">
              Pelita Hati dalam Setiap <span className="text-emerald-400">Lantunan Ayat.</span>
            </h2>

            <p className="text-[10px] sm:text-lg text-emerald-100/60 max-w-xl mb-8 sm:mb-10 font-medium leading-relaxed px-2">
              Membaca Al-Qur'an kini lebih nyaman dengan irama yang menyejukkan hati.
            </p>

            {/* Responsive Search Bar */}
            <div className="relative w-full max-w-2xl group px-2 sm:px-0">
              <div className="absolute inset-0 bg-emerald-400/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <div className="relative">
                <Search className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-emerald-400" size={18} sm:size={20} />
                <input 
                  type="text" 
                  placeholder="Cari Surah..."
                  className="w-full bg-white/10 backdrop-blur-xl border border-white/20 focus:border-emerald-400 focus:bg-white/20 text-white rounded-xl sm:rounded-2xl py-3.5 sm:py-6 pl-12 sm:pl-16 pr-6 outline-none text-sm sm:text-xl transition-all shadow-2xl placeholder:text-emerald-100/30 font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Quick Access chips - Hide on tiny screens or keep scrolling */}
            <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
               {QUICK_SURAHS.map(qs => (
                 <button 
                  key={qs.id}
                  onClick={() => openSurah(qs.id)}
                  className="px-3.5 py-1.5 sm:px-5 sm:py-2.5 bg-white/5 hover:bg-emerald-500/20 border border-white/10 rounded-lg sm:rounded-xl text-[9px] sm:text-xs text-emerald-200 font-bold transition-all flex items-center gap-2 backdrop-blur-sm active:scale-95"
                 >
                   <Clock size={12} className="opacity-50" /> {qs.name}
                 </button>
               ))}
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
        </section>

        {/* --- SURAH LIST GRID --- */}
        <div className="px-1 sm:px-2">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 sm:h-8 bg-emerald-600 rounded-full shadow-lg shadow-emerald-600/20"></div>
               <h3 className="text-base sm:text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase tracking-wider">Daftar Surah</h3>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
               <LayoutGrid size={14} /> {filteredSurahs.length} Surah
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Memuat...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mb-12">
              {filteredSurahs.map((surah) => (
                <div 
                  key={surah.nomor} onClick={() => openSurah(surah.nomor)}
                  className="group flex items-center gap-4 p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-900 rounded-xl sm:rounded-[2rem] hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-900/10 transition-all cursor-pointer relative overflow-hidden active:scale-95"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-xs sm:text-sm font-black text-slate-400 group-hover:bg-emerald-700 group-hover:text-white transition-all shadow-inner">
                    {surah.nomor}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-700 transition-colors truncate text-sm sm:text-base">{surah.namaLatin}</h3>
                    <p className="text-[8px] sm:text-[10px] font-medium text-slate-400 uppercase truncate tracking-tighter">{surah.arti} • {surah.jumlahAyat} Ayat</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-base sm:text-2xl font-serif text-emerald-800 dark:text-emerald-500">{surah.nama}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;